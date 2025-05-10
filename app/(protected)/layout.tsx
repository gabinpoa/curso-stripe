import Header from "@/components/header";
import { getUser } from "@/lib/db/queries";
import { User } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { cloneElement, ReactElement, ReactNode } from "react";

export interface MainLayoutChildProps {
  user: User;
}

export default async function MainLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }
  const email = user.email;
  const hasPassword = !!user.passwordHash;

  return (
    <>
      <Header hasPassword={hasPassword} email={email} />
      <main className="container flex-1 flex flex-col mx-auto py-6">
        {cloneElement(children as ReactElement<MainLayoutChildProps>, { user })}
      </main>
    </>
  );
}
