import { getUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import CreatePasswordClientPage from "./client-page";

async function CreatePasswordPage() {
  const user = await getUser();
  if (!user) {
    redirect("/sign-in");
  }
  if (user.passwordHash) {
    redirect("/");
  }

  return <CreatePasswordClientPage />;
}

export default CreatePasswordPage;
