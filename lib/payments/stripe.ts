import Stripe from "stripe";
import { redirect } from "next/navigation";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createCheckoutSession({
  customerId,
  priceId,
}: {
  customerId: string;
  priceId: string;
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
    client_reference_id: customerId,
    allow_promotion_codes: false,
    locale: "pt-BR",
  });

  redirect(session.url!);
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

export async function getExpandedProductsWithPrices(limit?: number) {
  const products = await stripe.products.list({
    active: true,
    limit: limit,
    expand: ["data.default_price"],
  });
  return products.data;
}
