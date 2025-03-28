import type { PreSignUpTriggerHandler } from 'aws-lambda';
import Stripe from 'stripe';
import { env } from '$amplify/env/pre-sign-up';

// Create a new customer in Stripe
// Return the customer ID
async function createCustomer(email: string): Promise<string> {
  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe secret key is missing');
  }
  const stripe = new Stripe(secretKey);
  const customer = await stripe.customers.create({ email });
  return customer.id;
}

export const handler: PreSignUpTriggerHandler = async (event) => {
  const email = event.request.userAttributes.email;
  const customerId = await createCustomer(email);
  if (!customerId) {
    throw new Error('Failed to create customer');
  }
  event.request.userAttributes['custom:customer_id'] = customerId;

  return event;
};
