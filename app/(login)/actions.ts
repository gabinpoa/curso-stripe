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

  redirect("/");
});

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { email, password, firstName, lastName } = data;

  const newUser = await createUser(email, password, firstName, lastName);

  if ("error" in newUser) {
    return newUser;
  }

  await setSession(newUser);

  redirect("/");
});

export async function signOut() {
  (await cookies()).delete("session");
}
