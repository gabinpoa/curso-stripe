import type React from 'react';
import { getUser } from '@/lib/db/queries';
import Header from '@/components/header';

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
