import { defineFunction, secret } from '@aws-amplify/backend';

export const preSignUp = defineFunction({
  name: 'pre-sign-up',
  resourceGroupName: 'auth',
  environment: {
    STRIPE_SECRET_KEY: secret('stripe_sk'),
  },
});
