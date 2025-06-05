"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { comparePasswords, setSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { validatedAction } from "@/lib/auth/middleware";
import { sendMagicLink } from "@/lib/auth/send-magic-link";

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

export async function signOut() {
  (await cookies()).delete("session");
  redirect("/sign-in");
}

const sendMagicLinkSchema = z.object({
  email: z.string().email("Email inválido."),
});

export const sendMagicLinkAction = validatedAction(
  sendMagicLinkSchema,
  async ({ email }) => {
    const customerInDb = await db.query.users.findFirst({
      where: (users) => eq(users.email, email),
      columns: {
        customerId: true,
        email: true,
      },
    });
    if (!customerInDb) {
      console.log("User not found in the database:", email);
      return { success: "Se o email existir, o link foi enviado com sucesso!" };
    }
    await sendMagicLink(email, customerInDb.customerId);
    return { success: "Se o email existir, o link foi enviado com sucesso!" };
  }
);
