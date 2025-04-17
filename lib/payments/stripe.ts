import Stripe from "stripe";
import { redirect } from "next/navigation";
import { Team } from "@/lib/db/schema";
import {
  getTeamByStripeCustomerId,
  unsafeGetCustomerId,
  updateTeamSubscription,
} from "@/lib/db/queries";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession({
  customerId,
  priceId,
  userId,
}: {
  customerId: string;
  priceId: string;
  userId?: number;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/#cursos`,
    customer: customerId,
    client_reference_id: userId ? userId.toString() : undefined,
    allow_promotion_codes: false,
    locale: "pt-BR",
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(team: Team) {
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect("/pricing");
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(team.stripeProductId);
    if (!product.active) {
      throw new Error("Team's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the team's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "Manage your subscription",
      },
      features: {
        subscription_cancel: {
          enabled: true,
          mode: "immediately",
          cancellation_reason: {
            enabled: true,
            options: [
              "too_expensive",
              "missing_features",
              "switched_service",
              "unused",
              "other",
            ],
          },
        },
        payment_method_update: {
          enabled: true,
        },
      },
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: team.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id,
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const team = await getTeamByStripeCustomerId(customerId);

  if (!team) {
    console.error("Team not found for Stripe customer:", customerId);
    return;
  }

  if (status === "active" || status === "trialing") {
    const plan = subscription.items.data[0]?.plan;
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: subscriptionId,
      stripeProductId: plan?.product as string,
      planName: (plan?.product as Stripe.Product).name,
      subscriptionStatus: status,
    });
  } else if (status === "canceled" || status === "unpaid") {
    await updateTeamSubscription(team.id, {
      stripeSubscriptionId: null,
      stripeProductId: null,
      planName: null,
      subscriptionStatus: status,
    });
  }
}

export async function getCustomerValidSubscriptions(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId, {
    expand: ["subscriptions.data"],
  });

  if (customer.deleted || !customer.subscriptions) {
    return [];
  }

  return customer.subscriptions.data.filter(
    (subscription) =>
      subscription.status === "active" || subscription.status === "trialing"
  );
}

export async function unsafeGetCustomerSubscriptionsProductsIds() {
  const customerId = await unsafeGetCustomerId();
  if (!customerId) {
    return null;
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    expand: ["data.items.data.price"],
  });

  const validSubscriptionsProductIds: string[] = [];
  for (const subscription of subscriptions.data) {
    if (
      subscription.status === "active" ||
      subscription.status === "trialing"
    ) {
      validSubscriptionsProductIds.push(
        subscription.items.data[0].price.product as string
      );
    }
  }

  return validSubscriptionsProductIds;
}

export async function getExpandedCustomerValidSubscriptions(
  customerId: string
) {
  const validSubscriptions = (
    await stripe.subscriptions.list({
      customer: customerId,
    })
  ).data.filter(
    (subscription) =>
      subscription.status === "active" || subscription.status === "trialing"
  );

  const expandedSubscriptions = await Promise.all(
    validSubscriptions.map(async (subscription) => {
      const product = await getProductById(
        subscription.items.data[0].price.product as string
      );

      return {
        ...subscription,
        product: product,
      };
    })
  );

  return expandedSubscriptions;
}

export async function getValidSubscriptionByCustomerIdAndProductId(
  customerId: string,
  productId: string
) {
  const validSubscriptions = await getCustomerValidSubscriptions(customerId);

  return (
    validSubscriptions.find(
      (subscription) => subscription.items.data[0]?.price.product === productId
    ) || null
  );
}

export async function getProductById(productId: string) {
  const product = await stripe.products.retrieve(productId);

  if (!product) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId: product.default_price as string,
    metadata: product.metadata,
    images: product.images,
  };
}

export async function getExpandedProductById(productId: string) {
  const expandedProduct = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  });
  const defaultPrice = expandedProduct.default_price;
  if (typeof defaultPrice !== "object" || !defaultPrice) {
    throw new Error("Product default price is not expanded");
  }
  return {
    id: expandedProduct.id,
    name: expandedProduct.name,
    description: expandedProduct.description,
    defaultPrice: defaultPrice,
    metadata: expandedProduct.metadata,
    images: expandedProduct.images,
  };
}

export async function getPriceById(priceId: string) {
  const price = await stripe.prices.retrieve(priceId);

  if (!price) {
    throw new Error(`Price with ID ${priceId} not found`);
  }

  if (!price.unit_amount) {
    throw new Error(`Price with ID ${priceId} has no unit amount`);
  }

  return {
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
  };
}

export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ["data.product"],
    active: true,
    type: "recurring",
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
    metadata: product.metadata,
    images: product.images,
  }));
}

export function getExpandedProductsWithPrices(limit?: number) {
  return stripe.products
    .list({
      active: true,
      limit: limit,
      expand: ["data.default_price"],
    })
    .then((products) => products.data);
}
