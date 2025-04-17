"use server";

import { redirect } from "next/navigation";
import { createCheckoutSession, createCustomerPortalSession } from "./stripe";
import { withTeam } from "@/lib/auth/middleware";
import { getUser } from "../db/queries";

export const checkoutAction = async (formData: FormData) => {
  const priceId = formData.get("priceId") as string;
  const redirectUrl = formData.get("redirectUrl") as string;
  const user = await getUser();
  if (!user) {
    redirect(redirectUrl);
  }
  await createCheckoutSession({
    customerId: user.customerId,
    priceId,
    userId: user.id,
  });
};

export const customerPortalAction = withTeam(async (_, team) => {
  const portalSession = await createCustomerPortalSession(team);
  redirect(portalSession.url);
});
