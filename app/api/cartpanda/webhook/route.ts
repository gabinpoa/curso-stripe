import { orders, Product, products, users } from "@/lib/db/schema"; // Import your orders schema
import { and, eq, or } from "drizzle-orm";
import {
  OrderPaidWebhook,
  OrderRefundedWebhook,
  ProductCreatedWebhook,
  ProductUpdatedWebhook,
} from "@/lib/cartpanda/webhook-types";
import { db } from "@/lib/db/drizzle";
import { createCustomerInDB } from "@/lib/auth/create-user";
import { sendMagicLink } from "@/lib/auth/send-magic-link";
import { cartpanda } from "@/lib/cartpanda/instance";
import { NextRequest } from "next/server";
import { sendRefundEmail } from "@/lib/email/refund-email";
import type { Order as CartpandaOrder } from "@/lib/cartpanda";

// --- Helper Functions ---

async function fetchOrderFromCartpanda(
  eventOrder: OrderPaidWebhook["order"] | OrderRefundedWebhook["order"]
) {
  try {
    const orderResponse = await cartpanda.getOrder(eventOrder.id.toString());
    return orderResponse.order;
  } catch (error) {
    console.error("Error fetching order from CartPanda:", error);
    return null;
  }
}

// Accept both CartpandaOrder and webhook order types
function getCustomerId(
  order:
    | CartpandaOrder
    | OrderPaidWebhook["order"]
    | OrderRefundedWebhook["order"]
) {
  // CartpandaOrder: customer_id (number|string), customer: { id: number|string, email: string }
  // Webhook order: customer_id (number|string), customer: { id: number|string, email: string }
  // All types should have these fields
  return order.customer_id?.toString() || order.customer?.id?.toString();
}

type WebhookLineItem = {
  product_id: string | number;
  title?: string;
  name?: string;
};
type CartpandaLineItem = {
  product_id?: string | number;
  id?: string | number;
  title?: string;
  name?: string;
};

function getOrderLineItems(
  eventOrder: OrderPaidWebhook["order"] | OrderRefundedWebhook["order"],
  order:
    | CartpandaOrder
    | OrderPaidWebhook["order"]
    | OrderRefundedWebhook["order"],
  event: string
): Array<{ product_id: string; title: string; name: string }> {
  const everyLineItemFromEventIsInOrder = eventOrder.line_items.every(
    (item) =>
      order.line_items.findIndex((i) => i.product_id === item.product_id) !== -1
  );
  const everyLineItemFromOrderIsInEvent = order.line_items.every(
    (item) =>
      eventOrder.line_items.findIndex(
        (i) => i.product_id === item.product_id
      ) !== -1
  );

  function getProductId(item: CartpandaLineItem | WebhookLineItem): string {
    if ("product_id" in item && item.product_id !== undefined)
      return String(item.product_id);
    if ("id" in item && item.id !== undefined) return String(item.id);
    return "";
  }

  let lineItems: Array<{ product_id: string; title: string; name: string }>;

  if (!everyLineItemFromEventIsInOrder) {
    console.log(
      "Item from event line items not found in order line items",
      event
    );
    lineItems = (
      order.line_items as Array<CartpandaLineItem | WebhookLineItem>
    ).map((item) => ({
      product_id: getProductId(item),
      title: String(item.title ?? item.name ?? ""),
      name: String(item.name ?? item.title ?? ""),
    }));
  } else {
    lineItems = (
      eventOrder.line_items as Array<CartpandaLineItem | WebhookLineItem>
    ).map((item) => ({
      product_id: getProductId(item),
      title: String(item.title ?? item.name ?? ""),
      name: String(item.name ?? item.title ?? ""),
    }));
    if (!everyLineItemFromOrderIsInEvent) {
      console.log(
        "Item from order line items not found in event line items",
        event
      );
    }
  }
  return lineItems;
}

async function upsertUserInDb(customerId: string, email: string) {
  try {
    const customerInDb = await db.query.users.findFirst({
      columns: { customerId: true },
      where: or(eq(users.customerId, customerId), eq(users.email, email)),
    });
    if (!customerInDb) {
      await createCustomerInDB(customerId, email);
    } else if (customerInDb.customerId !== customerId) {
      // Update the user to have the correct customerId
      await db.update(users).set({ customerId }).where(eq(users.email, email));
    }
    return null;
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}

// --- Event Handlers ---
async function handleOrderPaid(body: Record<string, unknown>) {
  const eventOrder = body.order as OrderPaidWebhook["order"] | undefined;
  if (!eventOrder) {
    return new Response(
      JSON.stringify({ error: "Invalid payload: order is required" }),
      { status: 400 }
    );
  }

  const order = await fetchOrderFromCartpanda(eventOrder);
  if (!order) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
  const orderId = order.id.toString();
  const orderToken = order.token;
  const customerId = getCustomerId(order);
  if (!customerId) {
    return new Response(JSON.stringify({ error: "No customer ID found" }), {
      status: 400,
    });
  }
  const email = order.customer.email;
  if (!email) {
    return new Response(JSON.stringify({ error: "No email found" }), {
      status: 400,
    });
  }
  const orderCreatedAt = new Date(order.created_at);
  const orderUpdatedAt = new Date(order.updated_at);
  const lineItems = getOrderLineItems(eventOrder, order, body.event as string);
  const userUpsertResponse = await upsertUserInDb(customerId, email);
  if (userUpsertResponse) return userUpsertResponse;

  if (order.status_id === "Refunded") {
    console.log("Refunded order received in paid event");
    return new Response(JSON.stringify({ error: "Order has been refunded" }), {
      status: 400,
    });
  }
  const coursesToSend: { name: string; id: string }[] = [];
  for (const lineItem of lineItems) {
    await db
      .insert(orders)
      .values({
        id: orderId,
        customerId: customerId,
        productId: lineItem.product_id,
        orderToken: orderToken,
        status: "paid",
        refunded: false,
        createdAt: orderCreatedAt,
        updatedAt: orderUpdatedAt,
      })
      .onDuplicateKeyUpdate({
        set: {
          status: "paid",
          refunded: false,
          updatedAt: orderUpdatedAt,
        },
      });
    coursesToSend.push({
      name: lineItem.title || lineItem.name || "",
      id: lineItem.product_id,
    });
  }
  await sendMagicLink(email, customerId, { courses: coursesToSend });
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

async function handleOrderRefunded(body: Record<string, unknown>) {
  const eventOrder = body.order as OrderRefundedWebhook["order"] | undefined;
  if (!eventOrder) {
    return new Response(
      JSON.stringify({ error: "Invalid payload: order is required" }),
      { status: 400 }
    );
  }

  const order = await fetchOrderFromCartpanda(eventOrder);
  if (!order) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
  const orderId = order.id.toString();
  const orderUpdatedAt = new Date(order.updated_at);
  const email = order.customer.email;
  const lineItems = getOrderLineItems(eventOrder, order, body.event as string);
  if (!email) {
    return new Response(JSON.stringify({ error: "No email found" }), {
      status: 400,
    });
  }
  if (lineItems.length === 0) {
    await db
      .update(orders)
      .set({
        refunded: true,
        updatedAt: orderUpdatedAt,
      })
      .where(eq(orders.id, orderId));
  } else {
    for (const lineItem of lineItems) {
      const productId = lineItem.product_id;
      await db
        .update(orders)
        .set({
          refunded: true,
          updatedAt: orderUpdatedAt,
        })
        .where(and(eq(orders.id, orderId), eq(orders.productId, productId)));
    }
  }
  const refundedCourses: { name: string; id: string }[] = lineItems.map(
    (lineItem) => ({
      name: lineItem.title || lineItem.name || "",
      id: lineItem.product_id,
    })
  );
  await sendRefundEmail(email, refundedCourses);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

async function handleProductCreated(body: Record<string, unknown>) {
  const eventProduct = body.product as
    | ProductCreatedWebhook["product"]
    | undefined;
  if (!eventProduct) {
    return new Response(
      JSON.stringify({ error: "Invalid payload: product is required" }),
      { status: 400 }
    );
  }
  const productId = eventProduct.id.toString();
  const product = await cartpanda.getProduct(productId);
  const productToInsert: Product = {
    id: product.id.toString(),
    name: product.title,
    status: product.status === "active" ? "active" : "inactive",
    thumbnail:
      product.images.length > 0
        ? product.images[0].url
        : "/static/placeholder.png",
    description: null,
    images: product.images.length > 0 ? JSON.stringify(product.images) : null,
  };

  await db.insert(products).values(productToInsert);
  return new Response(
    JSON.stringify({
      success: true,
      message: "Product created event received",
    }),
    { status: 200 }
  );
}

async function handleProductUpdated(body: Record<string, unknown>) {
  const eventProduct = body.product as
    | ProductUpdatedWebhook["product"]
    | undefined;
  if (!eventProduct) {
    return new Response(
      JSON.stringify({ error: "Invalid payload: product is required" }),
      { status: 400 }
    );
  }

  const productId = eventProduct.id.toString();
  const product = await cartpanda.getProduct(productId);

  const productToUpdate: Product = {
    id: product.id.toString(),
    name: product.title,
    status: product.status === "active" ? "active" : "inactive",
    thumbnail:
      product.images.length > 0
        ? product.images[0].url
        : "/static/placeholder.png",
    description: null,
    images: product.images.length > 0 ? JSON.stringify(product.images) : null,
  };

  await db
    .update(products)
    .set(productToUpdate)
    .where(eq(products.id, productId));
  return new Response(
    JSON.stringify({
      success: true,
      message: "Product updated event received",
    }),
    { status: 200 }
  );
}

// --- Main Handler ---
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { event } = body;

  try {
    switch (event) {
      case "order.paid":
        return await handleOrderPaid(body);
      case "order.refunded":
        return await handleOrderRefunded(body);
      case "product.created":
        return await handleProductCreated(body);
      case "product.updated":
        return await handleProductUpdated(body);
      default:
        return new Response(
          JSON.stringify({ error: "Unsupported event type" }),
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
