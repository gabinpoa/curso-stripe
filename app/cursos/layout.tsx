import Header from "@/components/header";
import { getUser } from "@/lib/db/queries";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  const userLoggedIn = !!user;
  const email = user?.email || undefined;
  return (
    <>
      <Header userLoggedIn={userLoggedIn} email={email} />
      <main className="container mx-auto py-6">{children}</main>
    </>
  );
}
