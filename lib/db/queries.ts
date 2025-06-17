import { and, desc, eq } from "drizzle-orm";
import { db } from "./drizzle";
import { Order, orders, users } from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "../auth/token";
import { unstable_cache } from "next/cache";
import {
  loadFullProduct,
  loadProductPreview,
  loadRestrictedProduct,
} from "../fs/queries";
import path from "path";
import { redirect } from "next/navigation";

export async function getUser() {
  const sessionData = await getVerifiedSession();
  if (!sessionData) {
    return null;
  }
  const customerId = sessionData.user.customerId;

  const getUserByIdCached = unstable_cache(
    async () => {
      const user = await db.query.users.findFirst({
        where: eq(users.customerId, customerId),
      });
      return user;
    },
    ["get-user-by-id", customerId],
    {
      tags: ["user", `user:${customerId}`],
      revalidate: 60 * 15,
    }
  );

  const user = await getUserByIdCached();

  if (!user) {
    return null;
  }

  return user;
}

export async function getVerifiedSession() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.customerId !== "string"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  return sessionData;
}

export interface Lesson {
  id: string;
  name: string;
  order: number;
  contentType: "MDX" | "VIDEO" | "DOCUMENT";
  content: string;
  mdxComponent?: React.ReactNode | null;
}

export interface Module {
  id: string;
  name: string;
  order: number;
  isExtraContent: boolean;
  lessons: Lesson[];
}

export interface CourseWithModulesWithLessons {
  id: string;
  name: string;
  thumbnail: string;
  description: string | null;
  modules: Module[];
}

export async function getCustomerBoughtProductsFromFileSystem() {
  const productsPath = path.join(process.cwd(), "produtos");
  const boughtProductsIds = await getCustomerBoughtProductsIds();
  if (!boughtProductsIds || boughtProductsIds.length === 0) {
    return [];
  }
  const products = boughtProductsIds.map((productId) => {
    return loadProductPreview(productsPath, productId);
  });
  return products.filter((product) => product !== null);
}

export async function getCustomerBoughtProductsIds() {
  const session = await getVerifiedSession();
  if (!session) {
    return undefined;
  }
  // Use Drizzle ORM instead of raw SQL
  const userWithBoughtProducts = await db.query.orders.findMany({
    columns: {
      productId: true,
    },
    with: {},
    where: and(
      eq(orders.customerId, session.user.customerId),
      eq(orders.status, "paid"),
      eq(orders.refunded, false)
    ),
  });
  const productsIds = userWithBoughtProducts.map((order) => order.productId);
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
    teamProductBought.status === "paid" &&
    teamProductBought.refunded === false
  );
}

function boughtInTheLastSevenDays(buyRecord: Order) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  return new Date(buyRecord.createdAt) > sevenDaysAgo;
}

export type UserAccessToCourseStatus = "allow_full" | "allow_partial" | "deny";
export async function getUserAccessToCourseStatus(
  customerId: string,
  productId: string
): Promise<UserAccessToCourseStatus> {
  const productBought = await getBuyRecordByCustomerIdAndProductId(
    customerId,
    productId
  );

  if (!productBought) {
    return "deny";
  } else if (hasNotRefundedPastSevenDays(productBought)) {
    return "allow_full";
  } else if (
    productBought.status === "paid" &&
    productBought.refunded === false
  ) {
    return "allow_partial";
  } else {
    return "deny";
  }
}

export async function getCourseFromFileSystem(productId: string) {
  const session = await getVerifiedSession();
  if (!session) {
    redirect("/sign-in");
  }
  const customerId = session.user.customerId;
  const userAccess = await getUserAccessToCourseStatus(customerId, productId);
  const productsPath = path.join(process.cwd(), "produtos");
  if (userAccess === "deny") {
    return null;
  } else if (userAccess === "allow_partial") {
    const product = loadRestrictedProduct(productsPath, productId);
    if (!product) {
      console.error(`Product ${productId} not found in file system.`);
    }
    return product;
  } else {
    const product = loadFullProduct(productsPath, productId);
    if (!product) {
      console.error(`Product ${productId} not found in file system.`);
    }
    return product;
  }
}

// Returns all course IDs for prerendering
export async function getAllCourseIds(): Promise<string[]> {
  const courses = await db.query.products.findMany({
    columns: { id: true },
  });
  return courses.map((course) => course.id);
}

export async function getCompletedLessons(productId: string) {
  const session = await getVerifiedSession();
  if (!session) {
    redirect("/sign-in");
  }
  const customerId = session.user.customerId;
  const response = await db.query.orders.findFirst({
    columns: { completedLessons: true },
    where: and(
      eq(orders.customerId, customerId),
      eq(orders.productId, productId),
      eq(orders.status, "paid"),
      eq(orders.refunded, false)
    ),
  });
  if (
    !response ||
    !response.completedLessons ||
    response.completedLessons === ""
  ) {
    return [];
  }
  return JSON.parse(response.completedLessons) as string[];
}
