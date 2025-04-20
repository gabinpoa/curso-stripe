"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { users, type NewUser } from "@/lib/db/schema";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createCheckoutSession, stripe } from "@/lib/payments/stripe";
import { validatedAction } from "@/lib/auth/middleware";

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data;

  const foundUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!foundUser) {
    return {
      error: "Invalid email or password. Please try again.",
      email,
      password,
    };
  }

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: "Invalid email or password. Please try again.",
      email,
      password,
    };
  }

  await setSession(foundUser);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    const priceId = formData.get("priceId") as string;
    return createCheckoutSession({ customerId: foundUser.customerId, priceId });
  }

  redirect("/");
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { email, password } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: "Failed to create user. Email already in use. Please try again.",
      email,
      password,
    };
  }

  const passwordHash = await hashPassword(password);

  const createdCustomerResponse = await stripe.customers.create({
    email,
  });
  const customerId = createdCustomerResponse.id;

  const newUser: NewUser = {
    email,
    passwordHash,
    customerId,
  };

  const queryResult = await db.insert(users).values(newUser);

  if (queryResult[0].affectedRows === 0) {
    return {
      error: "Failed to create user. Please try again.",
      email,
      password,
    };
  }

  await setSession(newUser);

  const redirectTo = formData.get("redirect") as string | null;
  if (redirectTo === "checkout") {
    const priceId = formData.get("priceId") as string;
    return createCheckoutSession({ customerId, priceId });
  }

  redirect("/");
});

export async function signOut() {
  (await cookies()).delete("session");
}
