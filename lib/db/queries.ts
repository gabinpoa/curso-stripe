import { desc, and, eq, isNull, asc, inArray } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, modules, teamMembers, teams, users } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';
import {
  getPriceById,
  getProductById,
  getValidSubscriptionByCustomerIdAndProductId,
} from '../payments/stripe';
import { JSX } from 'react';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function unsafeGetCustomerId() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number' ||
    new Date(sessionData.expires) < new Date()
  ) {
    return null;
  }

  const userId = sessionData.user.id;
  if (!userId) {
    return null;
  }

  const teamId = (await getUserWithTeam(userId)).teamId;
  if (!teamId) {
    return null;
  }

  return getTeamCustomerId(teamId);
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getTeamCustomerId(teamId: number) {
  const result = await db.query.teams.findFirst({
    where: eq(teams.id, teamId),
    columns: {
      stripeCustomerId: true,
    },
  });

  return result?.stripeCustomerId || null;
}

export async function getCustomerId() {
  const user = await getUser();
  if (!user) {
    return { message: 'User not authenticated' };
  }

  const teamId = (await getUserWithTeam(user.id)).teamId;
  if (!teamId) {
    return { message: 'User is not part of any team' };
  }

  const result = await getTeamCustomerId(teamId);
  if (!result) {
    return { message: 'Team has no Stripe customer ID associated' };
  }

  return result;
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser(userId: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      teamMembers: {
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.teamMembers[0]?.team || null;
}

export type ModulesAndLessonsMaybeComplete = {
  name: string;
  description: string | null;
  isExtraContent: boolean;
  lessons: Lesson[];
}[];

export type Lesson = {
  name: string;
  description: string | null;
  contentType?: 'MDX' | 'VIDEO';
  content?: string;
  mdxComponent?: JSX.Element;
};

export async function getModulesAndLessonsByProductId(
  productId: string
): Promise<ModulesAndLessonsMaybeComplete | { message: string }> {
  const customerId = await getCustomerId();

  if (typeof customerId === 'object' && 'message' in customerId) {
    return customerId; // Return error message
  }

  const subscription = await getValidSubscriptionByCustomerIdAndProductId(
    customerId,
    productId
  );

  const allModules = await db.query.modules.findMany({
    columns: {
      name: true,
      description: true,
      isExtraContent: true,
    },
    where: eq(modules.productId, productId),
    with: {
      lessons: {
        columns: {
          name: true,
          description: true,
          contentType: true,
          content: true,
        },
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
      },
    },
    orderBy: (modules, { asc }) => [asc(modules.order)],
  });

  if (!subscription) {
    return { message: 'User has no subscription to this product' };
  } else if (subscription.status === 'active') {
    // Return all content if user is subscribed and active
    return allModules;
  } else if (subscription.status === 'trialing') {
    // Don't return extra content if user is on trial
    return allModules.map((module) => {
      if (module.isExtraContent) {
        return {
          ...module,
          lessons: module.lessons.map((lesson) => ({
            name: lesson.name,
            description: lesson.description,
          })),
        };
      } else {
        return module;
      }
    });
  } else {
    return { message: 'User has no active subscription' };
  }
}

export async function getModulesAndLessonsPreviewByProductId(
  productId: string
) {
  const result = await db.query.modules.findMany({
    where: eq(modules.productId, productId),
    columns: {
      name: true,
      description: true,
      isExtraContent: true,
    },
    with: {
      lessons: {
        columns: {
          name: true,
          description: true,
        },
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
      },
    },
    orderBy: (modules, { asc }) => [asc(modules.order)],
  });

  return result;
}

export async function getProductContentById(productId: string) {
  const product = await getProductById(productId);
  const modules = await getModulesAndLessonsByProductId(productId);

  if ('message' in modules) {
    return modules; // Return error message
  }

  return {
    ...product,
    modules,
  };
}

export async function getProductPreviewById(productId: string) {
  const product = await getProductById(productId);
  if (!product.defaultPriceId) {
    throw new Error('Product has no default price');
  }
  const price = await getPriceById(product.defaultPriceId);

  return {
    ...product,
    price,
    modules: await getModulesAndLessonsPreviewByProductId(productId),
  };
}

export async function getProductsModulesPreview(productIds: string[]) {
  return await db
    .select()
    .from(modules)
    .where(inArray(modules.productId, productIds))
    .orderBy(asc(modules.order));
}
