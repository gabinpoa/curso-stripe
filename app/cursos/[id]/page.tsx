import { notFound, redirect } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";
import Fallback from "@/components/course-content/fallback";
import Header from "@/components/header";
import { getCourseFromFileSystem, getVerifiedSession } from "@/lib/db/queries";
import CourseContentSidebarTrigger from "@/components/course-content/sidebar-trigger";
import { Lesson } from "@/lib/fs/queries";
import { orders } from "@/lib/db/schema";
import { db } from "@/lib/db/drizzle";
import { and, eq } from "drizzle-orm";
import CourseContentPageClient from "@/components/course-content/client-page";
import { CourseDataProvider } from "@/lib/context/course-data";

type Props = { params: Promise<{ id: string }> };
export default async function Page({ params }: Props) {
  const { id } = await params;
  const courseContent = await getCourseFromFileSystem(id);
  if (!courseContent) {
    notFound();
  }

  async function updateCompletedLessonsOnDb(lessons: Lesson[]) {
    "use server";
    const session = await getVerifiedSession();
    if (!session) {
      redirect("/sign-in");
    }
    const customerId = session.user.customerId;
    const completedLessons = lessons
      .filter((lesson) => lesson.completed)
      .map((lesson) => lesson.id);
    const completedLessonsString = JSON.stringify(completedLessons);
    try {
      await db
        .update(orders)
        .set({ completedLessons: completedLessonsString })
        .where(
          and(eq(orders.productId, id), eq(orders.customerId, customerId))
        );
    } catch (error) {
      console.error("Server: Failed to update completed lessons in DB:", error);
      throw error;
    }
  }

  return (
    <div
      className="min-h-screen bg-zenite-background-neutral"
      style={{
        backgroundColor: courseContent.colors?.bg || undefined,
      }}
    >
      <SidebarProvider>
        <CourseDataProvider initialData={courseContent}>
          <div className="flex flex-1 flex-col w-full">
            {/* Global Header */}
            <div className="sticky top-0 z-50 space-y-4 flex flex-col">
              <Header colors={courseContent.colors} />
              <CourseContentSidebarTrigger />
            </div>

            <div className="flex flex-1">
              <Suspense fallback={<Fallback />}>
                <CourseContentPageClient
                  courseId={courseContent.id}
                  updateCompletedLessonsOnDb={updateCompletedLessonsOnDb}
                />
              </Suspense>
            </div>
          </div>
        </CourseDataProvider>
      </SidebarProvider>
    </div>
  );
}
