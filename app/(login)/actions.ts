"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { comparePasswords, setSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { validatedAction } from "@/lib/auth/middleware";
import { createUser } from "@/lib/auth/create-user";

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data) => {
  const { email, password } = data;

  const foundUser = await db.query.users.findFirst({
    where: eq(users.email, email),
    columns: {
      customerId: true,
      passwordHash: true,
      email: true,
    },
  });

  if (!foundUser) {
    return {
      error: "E-mail ou senha inválidos. Por favor, tente novamente.",
      email,
      password,
    };
  }

  if (!foundUser.passwordHash) {
    return {
      error: "E-mail ou senha inválidos. Por favor, tente novamente.",
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

  await setSession(foundUser.customerId);

  redirect("/");
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { email } = data;

  const newUser = await createUser(email);

  if ("error" in newUser) {
    return newUser;
  }

  await setSession(newUser.customerId);

  redirect("/");
});

export async function signOut() {
  (await cookies()).delete("session");
}
