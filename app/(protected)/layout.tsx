import Header from "@/components/header";
import { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="container flex-1 flex flex-col mx-auto py-6 px-4 md:px-6">
        {children}
      </main>
    </>
  );
}
