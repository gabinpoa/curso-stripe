import Header from '@/components/header';
import { getUser } from '@/lib/db/queries';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userLoggedIn = (await getUser()) !== null;
  return (
    <>
      <Header userLoggedIn={userLoggedIn} />
      <main className="container mx-auto py-6">{children}</main>
    </>
  );
}
