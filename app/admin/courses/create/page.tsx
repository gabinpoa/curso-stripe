import { CourseCreationForm } from "@/components/admin/course-creation-form";
import { getUser } from "@/lib/db/queries";
import { unauthorized } from "next/navigation";

export default async function CreateCoursePage() {
  const user = await getUser();
  if (!user || user.role !== "admin") {
    unauthorized();
  }
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
      <CourseCreationForm />
    </div>
  );
}
