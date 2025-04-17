import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { users, teams, teamMembers } from "@/lib/db/schema";
import { setSession } from "@/lib/auth/session";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription"],
    });

    if (!session.customer || typeof session.customer === "string") {
      console.log(session.customer);
      throw new Error("Invalid customer data from Stripe.");
    }

    const customerId = session.customer.id;
    session.pay;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price.product"],
    });

    const userId = session.client_reference_id;
    if (!userId) {
      throw new Error("No user ID found in session's client_reference_id.");
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error("Error handling successful checkout:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
