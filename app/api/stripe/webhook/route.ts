import Stripe from "stripe";
import { stripe } from "@/lib/payments/stripe";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { buyRecords } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed.", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "refund.created":
    case "refund.updated":
      const refund = event.data.object as Stripe.Refund;
      const paymentIntentId = refund.payment_intent as string;
      const status = refund.status;

      if (status === "succeeded") {
        await db
          .update(buyRecords)
          .set({ refunded: true })
          .where(eq(buyRecords.paymentIntentId, paymentIntentId));
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
