import { jwtVerify, SignJWT } from "jose";

type SessionData = {
  user: { customerId: string };
  expires: string;
};

const key = new TextEncoder().encode(process.env.AUTH_SECRET);

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1 day from now")
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload as SessionData;
}
