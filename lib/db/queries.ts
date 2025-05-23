import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { Order, orders, products, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '../auth/token';

export async function getUser() {
  const sessionData = await getVerifiedSession();
  if (!sessionData) {
    return null;
  }
  const user = await db.query.users.findFirst({
    where: eq(users.customerId, sessionData.user.customerId),
  });

  if (!user) {
    return null;
  }

  return user;
}

export async function getVerifiedSession() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.customerId !== 'string'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  return sessionData;
}

export type Lesson = {
  name: string;
  order: number;
  contentType: 'MDX' | 'VIDEO' | 'DOCUMENT';
  content: string;
  mdxComponent?: React.ReactNode | null;
};

export type Module = {
  id: string;
  name: string;
  order: number;
  isExtraContent: boolean;
  lessons: Lesson[];
};

export type CourseWithModulesWithLessons = {
  id: string;
  name: string;
  thumbnail: string;
  description: string | null;
  modules: Module[];
};

export async function getCourseWithFullModules(
  productId: string
): Promise<CourseWithModulesWithLessons | null> {
  const course = await db.query.products.findFirst({
    columns: {
      id: true,
      name: true,
      thumbnail: true,
      description: true,
    },
    with: {
      modules: {
        columns: {
          id: true,
          name: true,
          order: true,
          isExtraContent: true,
        },
        with: {
          lessons: {
            columns: {
              content: true,
              contentType: true,
              name: true,
              order: true,
            },
          },
        },
      },
    },
    where: eq(products.id, productId),
  });

  return course ? course : null;
}

export async function getCourseWithNonExtraModulesContent(
  productId: string
): Promise<CourseWithModulesWithLessons | null> {
  const course = await db.query.products.findFirst({
    columns: {
      id: true,
      name: true,
      thumbnail: true,
      description: true,
    },
    with: {
      modules: {
        columns: {
          id: true,
          name: true,
          order: true,
          isExtraContent: true,
        },
        with: {
          lessons: {
            columns: {
              content: true,
              contentType: true,
              name: true,
              order: true,
            },
          },
        },
      },
    },
    where: eq(products.id, productId),
  });
  if (!course) return null;
  course.modules = course.modules.map((module_) => {
    if (!module_.isExtraContent) {
      return module_;
    }
    module_.lessons = module_.lessons.map((lesson) => {
      return {
        ...lesson,
        content: '# Esse conteúdo fica disponível 7 dias após a compra',
        contentType: 'MDX',
      };
    });
    return module_;
  });
  return course;
}

export async function getCoursePreview(productId: string) {
  const course = await db.query.products.findFirst({
    with: {
      modules: {
        with: {
          lessons: {
            columns: {
              content: false,
              contentType: false,
            },
          },
        },
      },
    },
    where: eq(products.id, productId),
  });

  return course;
}

export async function getCustomerBoughtProductsModules() {
  const session = await getVerifiedSession();
  if (!session) {
    return undefined;
  }
  const userBoughtRecords = await db.query.orders.findMany({
    columns: {},
    with: {
      product: {
        columns: {
          id: true,
          name: true,
          thumbnail: true,
          description: true,
        },
        with: {
          modules: {
            columns: {
              id: true,
              name: true,
              order: true,
              isExtraContent: true,
            },
          },
        },
      },
    },
    where: and(
      eq(orders.customerId, session.user.customerId),
      eq(orders.status, 'paid'),
      eq(orders.refunded, false)
    ),
  });
  return userBoughtRecords.map((record) => record.product);
}

export async function getCustomerBoughtProductsIds() {
  const session = await getVerifiedSession();
  if (!session) {
    return undefined;
  }
  const userWithBoughtProducts = await db.execute(
    sql.raw(`
    SELECT b.product_id FROM users u
    INNER JOIN buy_record b ON u.customer_id = b.customer_id
    WHERE b.status = 'paid' AND b.refunded = false
    AND u.deleted_at IS NULL AND u.customer_id = '${session.user.customerId}'
  `)
  );
  const productsIds = Array.isArray(userWithBoughtProducts[0])
    ? userWithBoughtProducts[0].map(
      (record: { product_id: string }) => record.product_id
    )
    : [];
  return productsIds;
}

async function getBuyRecordByCustomerIdAndProductId(
  customerId: string,
  productId: string
) {
  const result = await db
    .select()
    .from(orders)
    .where(
      and(eq(orders.customerId, customerId), eq(orders.productId, productId))
    )
    .orderBy(desc(orders.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

function hasNotRefundedPastSevenDays(teamProductBought: Order) {
  return (
    !boughtInTheLastSevenDays(teamProductBought) &&
    teamProductBought.status === 'paid' &&
    teamProductBought.refunded === false
  );
}

function boughtInTheLastSevenDays(buyRecord: Order) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  return new Date(buyRecord.createdAt) > sevenDaysAgo;
}

export type UserAccessToCourseStatus = 'allow_full' | 'allow_partial' | 'deny';
async function getUserAccessToCourseStatus(
  customerId: string,
  productId: string
): Promise<UserAccessToCourseStatus> {
  const productBought = await getBuyRecordByCustomerIdAndProductId(
    customerId,
    productId
  );

  if (!productBought) {
    return 'deny';
  } else if (hasNotRefundedPastSevenDays(productBought)) {
    return 'allow_full';
  } else if (
    productBought.status === 'paid' &&
    productBought.refunded === false
  ) {
    return 'allow_partial';
  } else {
    return 'deny';
  }
}

export async function getCourse(productId: string) {
  const session = await getVerifiedSession();
  if (!session) {
    return null;
  }
  const customerId = session.user.customerId;
  const userAccess = await getUserAccessToCourseStatus(customerId, productId);
  if (userAccess === 'deny') {
    return null;
  } else if (userAccess === 'allow_partial') {
    return await getCourseWithNonExtraModulesContent(productId);
  } else {
    return await getCourseWithFullModules(productId);
  }
}
