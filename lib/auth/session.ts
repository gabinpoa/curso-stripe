import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { signToken, verifyToken } from "./token";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

export type SessionData = {
  user: { customerId: string };
  expires: string;
};

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function setSession(customerId: string) {
  const { encryptedSession, expiresInOneMonth } = await createEncryptedSession(customerId);
  await setASession(encryptedSession, expiresInOneMonth);
}

export async function setASession(encryptedSession: string, expiresIn: Date) {
  (await cookies()).set("session", encryptedSession, {
    expires: expiresIn,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
}

export async function createEncryptedSession(customerId: string) {
  const expiresInOneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { customerId },
    expires: expiresInOneMonth.toISOString(),
  };
  const encryptedSession = await signToken(session);
  return { encryptedSession, expiresInOneMonth };
}

