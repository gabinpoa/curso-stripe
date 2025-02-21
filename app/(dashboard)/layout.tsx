import type React from 'react';
import Link from 'next/link';
import { siteName } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
