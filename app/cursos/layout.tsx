import Header from '@/components/header';
import { AuthGetCurrentUserServer } from '@/utils/amplify-utils';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userLoggedIn = !!(await AuthGetCurrentUserServer());
  return (
    <>
      <Header userLoggedIn={userLoggedIn} />
      <main className="container mx-auto py-6">{children}</main>
    </>
  );
}
