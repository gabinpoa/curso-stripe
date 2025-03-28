// utils/amplify-utils.ts
import { cookies } from 'next/headers';

import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth/server';

import { type Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';
import { AuthError } from 'aws-amplify/auth';

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export const cookiesClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

export async function AuthGetCurrentUserServer() {
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    return currentUser;
  } catch (error: any) {
    if (error instanceof AuthError) {
      console.log('not authenticated');
    } else {
      console.error(error);
    }
  }
}

export async function fetchUserAttributesServer() {
  try {
    const userAttributes = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => fetchUserAttributes(contextSpec),
    });
    return userAttributes;
  } catch (error: any) {
    if (error instanceof AuthError) {
      console.log('not authenticated');
    } else {
      console.error(error);
    }
  }
}
