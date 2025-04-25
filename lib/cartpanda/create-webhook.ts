import { cartpanda } from "./instance";

if (!process.env.BASE_URL) {
  throw new Error("BASE_URL is not set");
}

async function createWebhook() {
  try {
    const webhookCreateResponse = await cartpanda.createWebhook({
      endpoint: `${process.env.BASE_URL}/api/cartpanda/webhook`,
      events: [{ event: "order.refunded" }, { event: "order.paid" }],
    });

    console.log("Webhook created successfully:", webhookCreateResponse);
  } catch (error) {
    console.error("Error creating webhook:", error);
  }
}

createWebhook();
