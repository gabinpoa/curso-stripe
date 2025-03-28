import SubscriptionSettings from './subscription';
import {
  cookiesClient,
  fetchUserAttributesServer,
} from '@/utils/amplify-utils';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const userAttributes = await fetchUserAttributesServer();

  if (!userAttributes) {
    redirect('/login');
  } else if (!userAttributes['custom:customer_id'] || !userAttributes.email) {
    throw new Error('User attributes are missing: customer_id or email');
  }

  const { data: subscriptions, errors } =
    await cookiesClient.models.CourseSubscription.list({
      filter: {
        customerId: {
          eq: userAttributes['custom:customer_id'],
        },
      },
      selectionSet: ['subscriptionId', 'productName', 'status'],
      authMode: 'userPool',
    });

  if (errors) {
    console.error('Failed to fetch subscriptions:', errors);
    throw new Error('Could not fetch subscriptions');
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <SubscriptionSettings
        email={userAttributes.email}
        subscriptions={subscriptions}
      />
    </section>
  );
}
