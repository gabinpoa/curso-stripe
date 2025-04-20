"use server";

import { redirect } from "next/navigation";
import { createCheckoutSession } from "./stripe";
import { getUser } from "../db/queries";

export const checkoutAction = async (formData: FormData) => {
  const priceId = formData.get("priceId") as string;
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }
  await createCheckoutSession({
    customerId: user.customerId,
    priceId,
  });
};
