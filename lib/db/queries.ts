import { desc, and, eq, isNull, asc, inArray } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  modules,
  teamMembers,
  buyRecord,
  teams,
  users,
  BuyAction,
} from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/token";
import { getPriceById, getProductById } from "../payments/stripe";
import { JSX } from "react";
import Stripe from "stripe";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
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
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number" ||
    new Date(sessionData.expires) < new Date()
  ) {
    return null;
  }

  const userId = sessionData.user.id;
  if (!userId) {
    return null;
  }

  const userWithTeam = await getUserWithTeam(userId);
  const teamId = userWithTeam ? userWithTeam.teamId : null;
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

  if (result.length === 0) {
    return null;
  }
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
    return { message: "User not authenticated" };
  }

  const userWithTeam = await getUserWithTeam(user.id);
  const teamId = userWithTeam ? userWithTeam.teamId : null;
  if (!teamId) {
    return { message: "User is not part of any team" };
  }

  const result = await getTeamCustomerId(teamId);
  if (!result) {
    return { message: "Team has no Stripe customer ID associated" };
  }

  return result;
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error("User not authenticated");
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
  contentType?: "MDX" | "VIDEO";
  content?: string;
  mdxComponent?: JSX.Element;
};

async function getBuyRecordByCustomerIdAndProductId(
  customerId: string,
  productId: string
) {
  const result = await db
    .select()
    .from(buyRecord)
    .where(
      and(
        eq(buyRecord.customerId, customerId),
        eq(buyRecord.productId, productId)
      )
    )
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

function hasNotRefundedPastSevenDays(teamProductBought: BuyAction) {
  return (
    !boughtInTheLastSevenDays(teamProductBought) &&
    teamProductBought.status === "paid" &&
    teamProductBought.refunded === false
  );
}

function boughtInTheLastSevenDays(teamProductBought: BuyAction) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);
  return teamProductBought.createdAt > sevenDaysAgo;
}

export async function getModulesAndLessonsByProductId(
  productId: string
): Promise<ModulesAndLessonsMaybeComplete | { message: string }> {
  const customerId = await getCustomerId();

  if (typeof customerId === "object" && "message" in customerId) {
    return customerId; // Return error message
  }

  const productBought = await getBuyRecordByCustomerIdAndProductId(
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

  if (!productBought) {
    return { message: "User hasn't bought this product" };
  } else if (hasNotRefundedPastSevenDays(productBought)) {
    // Return all content if user has bought the product and not refunded it in the last 7 days
    return allModules;
  } else if (
    productBought.status === "paid" &&
    productBought.refunded === false
  ) {
    // Don't return extra content if user has bought the product in the last 7 days and not refunded it
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
    return {
      message: `Refunded: ${productBought.refunded}, Paid: ${productBought.status}`,
    };
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

export type ProductContent = {
  modules: ModulesAndLessonsMaybeComplete;
  id: string;
  name: string;
  description: string | null;
  defaultPriceId: string;
  metadata: Stripe.Metadata;
  images: string[];
};
export async function getProductContentById(
  productId: string
): Promise<ProductContent | { message: string }> {
  const product = await getProductById(productId);
  const modules = await getModulesAndLessonsByProductId(productId);

  if ("message" in modules) {
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
    throw new Error("Product has no default price");
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
