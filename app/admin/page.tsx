import AdminPageComponent from "@/components/admin-page";
import { getUser } from "@/lib/db/queries";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin - Seed Data",
  description: "Seed data for courses, modules, and lessons.",
};

export default async function AdminPage() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return <AdminPageComponent />;
}
