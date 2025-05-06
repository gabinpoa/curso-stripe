import { orders, users } from '@/lib/db/schema'; // Import your orders schema
import { and, eq, or } from 'drizzle-orm';
import {
  OrderPaidWebhook,
  OrderRefundedWebhook,
} from '@/lib/cartpanda/webhook-types';
import { db } from '@/lib/db/drizzle';
import { createUser } from '@/lib/auth/create-user';
import { sendMagicLink } from '@/lib/auth/send-magic-link';
import { cartpanda } from '@/lib/cartpanda/instance';
import { Order } from '@/lib/cartpanda';
import { NextRequest } from 'next/server';

export async function POST(
  req: NextRequest,
) {
  const body = await req.json() as OrderPaidWebhook | OrderRefundedWebhook;
  const { event, order: eventOrder } = body;
  // orderEvent can't always be trusted, so we need to get the order from cartpanda
  // to ensure we have the correct order data.

  if (!eventOrder) {
    return new Response(JSON.stringify({ error: 'Invalid payload: order is required' }), { status: 400 });
  }

  let order;
  try {
    const orderResponse = await cartpanda.getOrder(eventOrder.id.toString());
    order = orderResponse.order;
  } catch (error) {
    console.error('Error fetching order from CartPanda:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  const orderId = order.id.toString();
  const orderToken = order.token;
  const customerId = order.customer_id.toString() || order.customer.id.toString();
  if (!customerId) {
    return new Response(JSON.stringify({ error: 'No customer ID found' }), { status: 400 });
  }
  const email = order.customer.email;
  if (!email) {
    return new Response(JSON.stringify({ error: 'No email found' }), { status: 400 });
  }
  const orderCreatedAt = new Date(order.created_at);
  const orderUpdatedAt = new Date(order.updated_at);

  const everyLineItemFromEventIsInOrder = eventOrder.line_items.every((item) => order.line_items.findIndex((i) => i.product_id === item.product_id) !== -1);
  const everyLineItemFromOrderIsInEvent = order.line_items.every((item) => eventOrder.line_items.findIndex((i) => i.product_id === item.product_id) !== -1);

  let lineItems: Order['line_items'] | OrderRefundedWebhook['order']['line_items'] | OrderPaidWebhook['order']['line_items'] = eventOrder.line_items;

  if (!everyLineItemFromEventIsInOrder) {
    console.log('Item from event line items not found in order line items', event);
    // In this case the event order cannot be trusted, so we need to get the order from cartpanda
    lineItems = order.line_items;
  } else if (!everyLineItemFromOrderIsInEvent) {
    console.log('Item from order line items not found in event line items', event);
  }

  try {
    const customerInDb = await db.query.users.findFirst({
      columns: {
        customerId: true,
      },
      where: or(eq(users.customerId, customerId), eq(users.email, email)),
    });

    if (!customerInDb) {
      await createUser(
        eventOrder.customer.email,
      );
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }

  try {
    switch (event) {
      case 'order.paid': {
        // Handle order.paid webhook for every line item
        if (order.status_id === 'Refunded') {
          console.log('Refunded order received in paid event');
          return new Response(JSON.stringify({ error: 'Order has been refunded' }), { status: 400 });
        }

        for (const lineItem of lineItems) {
          await db
            .insert(orders)
            .values({
              id: orderId,
              customerId: customerId,
              productId: lineItem.product_id.toString(),
              orderToken: orderToken,
              status: 'paid',
              refunded: false,
              createdAt: orderCreatedAt,
              updatedAt: orderUpdatedAt,
            })
            .onDuplicateKeyUpdate({
              set: {
                status: 'paid',
                refunded: false,
                updatedAt: orderUpdatedAt,
              },
            });

          await sendMagicLink(
            email, customerId, {
            courseName: lineItem.title || lineItem.name,
            courseId: lineItem.product_id.toString()
          })
        }
        break;
      }
      case 'order.refunded': {
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
            const productId = lineItem.product_id.toString();

            await db
              .update(orders)
              .set({
                refunded: true,
                updatedAt: orderUpdatedAt,
              })
              .where(and(
                eq(orders.id, orderId),
                eq(orders.productId, productId)
              ));
          }
        }
        break;
      }
      default: {
        return new Response(JSON.stringify({ error: 'Unsupported event type' }), { status: 400 });
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}
