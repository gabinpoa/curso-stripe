import {
  cookiesClient,
  fetchUserAttributesServer,
} from '@/utils/amplify-utils';
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession({
  customerId,
  priceId,
}: {
  customerId: string;
  priceId: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}`,
    customer: customerId,
    allow_promotion_codes: false,
    subscription_data: {
      trial_period_days: 7,
    },
    locale: 'pt-BR',
  });

  return session.url;
}

export async function createCustomerPortalSession(customerId: string) {
  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Manage your subscription',
      },
      features: {
        subscription_cancel: {
          enabled: true,
          mode: 'immediately',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other',
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
    customer: customerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id,
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const subscriptionId = subscription.id;
  const status = subscription.status;

  await cookiesClient.models.CourseSubscription.update(
    {
      subscriptionId,
      status,
    },
    {
      authMode: 'userPool',
    }
  );
}

export async function getCustomerValidSubscriptions(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId, {
    expand: ['subscriptions.data'],
  });

  if (customer.deleted || !customer.subscriptions) {
    return [];
  }

  return customer.subscriptions.data.filter(
    (subscription) =>
      subscription.status === 'active' || subscription.status === 'trialing'
  );
}

export async function getCustomerSubscriptions(customerId: string) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    expand: ['items.data.price.product'],
  });
  return subscriptions.data;
}

export async function getCustomerSubscriptionsProductsIds(customerId: string) {
  if (!customerId) {
    return null;
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    expand: ['data.items.data.price'],
  });

  let validSubscriptionsProductIds: string[] = [];
  for (const subscription of subscriptions.data) {
    if (
      subscription.status === 'active' ||
      subscription.status === 'trialing'
    ) {
      validSubscriptionsProductIds.push(
        subscription.items.data[0].price.product as string
      );
    }
  }

  return validSubscriptionsProductIds;
}

export async function getCustomerValidSubscriptionsWithProductData(
  customerId: string
) {
  const validSubscriptions = (
    await stripe.subscriptions.list({
      customer: customerId,
    })
  ).data.filter(
    (subscription) =>
      subscription.status === 'active' || subscription.status === 'trialing'
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

export async function getProductByIdWithPriceData(productId: string) {
  const expandedProduct = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  });
  const defaultPrice = expandedProduct.default_price;
  if (typeof defaultPrice !== 'object' || !defaultPrice) {
    throw new Error('Product default price is not expanded');
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

  if (price.type !== 'recurring') {
    throw new Error(`Price with ID ${priceId} is not recurring`);
  }

  if (!price.unit_amount) {
    throw new Error(`Price with ID ${priceId} has no unit amount`);
  }

  return {
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring!.interval,
    trialPeriodDays: price.recurring!.trial_period_days,
  };
}

export async function getStripePrices() {
  return await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring',
  });
}

export async function getStripeProducts() {
  return await stripe.products.list({
    active: true,
  });
}

export async function getExpandedProductsWithPrices(limit?: number) {
  const products = await stripe.products.list({
    active: true,
    limit: limit,
    expand: ['data.default_price'],
  });
  return products.data;
}

export async function isSubscriptionOnTrial(
  status: Stripe.Subscription.Status,
  start_date: number | string
) {
  const subscriptionStartDate = new Date(
    typeof start_date === 'string' ? start_date : start_date * 1000
  );
  const dateNow = new Date();

  const trialEndDate = new Date(subscriptionStartDate);
  trialEndDate.setDate(trialEndDate.getDate() + 7);

  return dateNow < trialEndDate || status === 'trialing';
}

export async function canAccessExtraContent(
  status: Stripe.Subscription.Status,
  start_date: number | string
) {
  return (
    status === 'active' && !(await isSubscriptionOnTrial(status, start_date))
  );
}
