import { notFound } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";
import CourseContentPageClient from "@/components/course-content/client-page";
import Fallback from "@/components/course-content/fallback";
import Header from "@/components/header";
import { getCourseFromFileSystem } from "@/lib/db/queries";
import CourseContentSidebarTrigger from "@/components/course-content/sidebar-trigger";
import { Lesson } from "@/lib/fs/queries";
import { orders } from "@/lib/db/schema";
import { db } from "@/lib/db/drizzle";

type Props = { params: Promise<{ id: string }> };
export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex flex-1 flex-col w-full">
          {/* Global Header */}
          <div className="sticky top-0 z-50 space-y-4 flex flex-col">
            <Header />
            <CourseContentSidebarTrigger />
          </div>

          <div className="flex flex-1">
            <Suspense fallback={<Fallback />}>
              <CourseContentPage id={id} />
            </Suspense>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}

async function CourseContentPage({ id }: { id: string }) {
  const courseContent = await getCourseFromFileSystem(id);
  if (!courseContent) {
    notFound();
  }

  async function updateCompletedLessonsOnDb(lessons: Lesson[]) {
    "use server";
    const completedLessons = lessons
      .filter((lesson) => lesson.completed)
      .map((lesson) => lesson.id);
    const completedLessonsString = JSON.stringify(completedLessons);
    try {
      await db.update(orders).set({ completedLessons: completedLessonsString });
    } catch (error) {
      console.error("Server: Failed to update completed lessons in DB:", error);
      throw error; // Re-throw to handle it in the calling function
    }
  }
  return (
    <CourseContentPageClient
      updateCompletedLessonsOnDb={updateCompletedLessonsOnDb}
      courseContent={courseContent}
    />
  );
}
