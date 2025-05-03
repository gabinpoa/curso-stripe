import { config } from "dotenv";
import { CartPanda } from ".";
config();

if (!process.env.CARTPANDA_BEARER_TOKEN) {
  throw new Error("CARTPANDA_BEARER_TOKEN is not set");
}
if (!process.env.CARTPANDA_STORE_SLUG) {
  throw new Error("CARTPANDA_STORE_SLUG is not set");
}

const { CARTPANDA_BEARER_TOKEN, CARTPANDA_STORE_SLUG } = process.env;

export const cartpanda = new CartPanda(
  CARTPANDA_BEARER_TOKEN,
  CARTPANDA_STORE_SLUG
);
