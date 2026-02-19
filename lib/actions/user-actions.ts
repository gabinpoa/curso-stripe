"use server";

import { hashPassword } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { validatedActionWithUser } from "../auth/middleware";
import { revalidateTag } from "next/cache";

const createPasswordSchema = z.object({
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres."),
});

export const createPasswordAction = validatedActionWithUser(
  createPasswordSchema,
  async ({ password }, _, user) => {
    if (user.passwordHash) {
      console.log("User already has a password hash", user.email);
      return {
        error: "Erro ao criar senha. Tente novamente mais tarde.",
        email: user.email,
      };
    }
    const hashedPassword = await hashPassword(password);

    // Update the user's record with the hashed password
    const result = await db
      .update(users)
      .set({ passwordHash: hashedPassword })
      .where(eq(users.customerId, user.customerId));

    if (result[0].affectedRows === 0) {
      return {
        error: "Erro ao criar senha. Tente novamente mais tarde.",
        email: user.email,
      };
    }

    revalidateTag(`user:${user.customerId}`, {expire: 0});

    return { success: "Senha criada com sucesso", email: user.email };
  }
);
