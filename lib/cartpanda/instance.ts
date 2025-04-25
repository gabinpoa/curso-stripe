import { config } from "dotenv";
import { CartPanda } from ".";
config();

const { CARTPANDA_BEARER_TOKEN, CARTPANDA_STORE_SLUG } = process.env;
if (!CARTPANDA_BEARER_TOKEN) {
  throw new Error("CARTPANDA_BEARER_TOKEN is not set");
}
if (!CARTPANDA_STORE_SLUG) {
  throw new Error("CARTPANDA_STORE_SLUG is not set");
}

export const cartpanda = new CartPanda(
  CARTPANDA_BEARER_TOKEN,
  CARTPANDA_STORE_SLUG
);
