import { db } from "@/lib/db/drizzle";
import { buyRecords } from "@/lib/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    if (!session) {
      throw new Error("Session not found.");
    }
    if (session.mode !== "payment") {
      throw new Error("Session is not a payment session.");
    }
    if (!session.line_items) {
      throw new Error("No line items found in the session.");
    }
    if (session.line_items.data.some((item) => !item.price)) {
      throw new Error("One or more line items are missing price information.");
    }
    if (session.line_items.data.length === 0) {
      throw new Error("No line items found in the session.");
    }
    if (!session.client_reference_id) {
      throw new Error("No client reference ID found in the session.");
    }
    if (typeof session.payment_intent !== "string") {
      throw new Error("Payment intent is not a string.");
    }

    const customerId = session.client_reference_id;
    const paymentStatus = session.payment_status;
    const paymentIntentId = session.payment_intent;

    await Promise.all(
      session.line_items.data.map(async (lineItem) => {
        await db.insert(buyRecords).values({
          customerId: customerId,
          productId: lineItem.price!.product as string,
          paymentIntentId: paymentIntentId,
          status: paymentStatus,
          refunded: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      })
    );

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error handling successful checkout:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
