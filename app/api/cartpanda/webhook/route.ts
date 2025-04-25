import { NextApiRequest, NextApiResponse } from 'next';
import { orders, users } from '@/lib/db/schema'; // Import your orders schema
import { eq, or } from 'drizzle-orm';
import {
  OrderCreatedWebhook,
  OrderPaidWebhook,
  OrderRefundedWebhook,
} from '@/lib/cartpanda/webhook-types';
import { db } from '@/lib/db/drizzle';
import { createUser, generateRandomPassword } from '@/lib/auth/create-user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event, order } = req.body as
    | OrderPaidWebhook
    | OrderRefundedWebhook
    | OrderCreatedWebhook;

  const customerId = order.customer_id.toString();
  const email = order.customer.email;

  const customerInDb = await db.query.users.findFirst({
    columns: {
      customerId: true,
    },
    where: or(eq(users.customerId, customerId), eq(users.email, email)),
  });

  if (!customerInDb) {
    await createUser(
      order.customer.email,
      generateRandomPassword(12),
      order.customer.first_name,
      order.customer.last_name
    );
  }

  try {
    switch (event) {
      case 'order.paid': {
        const paidOrder = order as OrderPaidWebhook['order']; // Type assertion for order.paid
        // Handle order.paid webhook for every line item
        const lineItems = paidOrder.line_items;
        for (const lineItem of lineItems) {
          await db
            .insert(orders)
            .values({
              id: paidOrder.id.toString(),
              customerId: customerId,
              productId: lineItem.product_id.toString(),
              orderToken: paidOrder.token,
              status: 'paid',
              refunded: false,
              createdAt: new Date(paidOrder.created_at),
              updatedAt: new Date(paidOrder.updated_at),
            })
            .onDuplicateKeyUpdate({
              set: {
                status: 'paid',
                refunded: false,
                updatedAt: new Date(paidOrder.updated_at),
              },
            });
        }
        break;
      }
      case 'order.refunded': {
        const refundedOrder = order as OrderRefundedWebhook['order']; // Type assertion for order.refunded
        // Handle order.refunded webhook for every line item
        const lineItems = refundedOrder.line_items;
        if (lineItems.length === 0) {
          await db
            .update(orders)
            .set({
              refunded: true,
              updatedAt: new Date(refundedOrder.updated_at),
            })
            .where(eq(orders.id, refundedOrder.id.toString()));
        } else {
          for (const lineItem of lineItems) {
            const status = parseInt(refundedOrder.status_id, 10);
            const isRefunded = status === 5 || status === 6; // Refunded or Partially Refunded

            await db
              .update(orders)
              .set({
                refunded: isRefunded,
                updatedAt: new Date(refundedOrder.updated_at),
              })
              .where(
                eq(orders.id, refundedOrder.id.toString()) &&
                  eq(orders.productId, lineItem.product_id.toString())
              );
          }
        }
        break;
      }
      default: {
        return res.status(400).json({ error: 'Unsupported event type' });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
