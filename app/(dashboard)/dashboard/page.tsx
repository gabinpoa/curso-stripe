import { redirect } from 'next/navigation';
import SubscriptionSettings from './subcription';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import AccountSettings from './account';

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const teamData = await getTeamForUser(user.id);

  if (!teamData) {
    throw new Error('Team not found');
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <SubscriptionSettings teamData={teamData} />
      <AccountSettings />
    </section>
  );
}
