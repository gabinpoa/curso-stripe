import Header from "@/components/header";
import { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="sticky top-0 z-50 bg-white border-b">
        <Header />
      </div>
      <main className="container flex-1 flex flex-col mx-auto py-6">
        {children}
      </main>
    </>
  );
}
