'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { fetchUserAttributesServer } from '@/utils/amplify-utils';

export async function checkoutAction(formData: {
  get(name: string): FormDataEntryValue | null;
}) {
  const priceId = formData.get('priceId') as string;
  const userAttributes = await fetchUserAttributesServer();
  if (!userAttributes) {
    redirect('/login?checkout=true&priceId=' + priceId);
  }
  const customerId = userAttributes['custom:customer_id'];

  if (!customerId) {
    throw new Error('User attributes are missing: customerId');
  }

  await createCheckoutSession({ customerId, priceId });
}

export async function customerPortalAction() {
  const userAttributes = await fetchUserAttributesServer();
  if (!userAttributes) {
    throw new Error('Cannot get user attributes');
  }

  const customerId = userAttributes['custom:customer_id'];
  if (!customerId) {
    throw new Error('User attributes are missing: customerId');
  }

  const portalSession = await createCustomerPortalSession(customerId);
  redirect(portalSession.url);
}
