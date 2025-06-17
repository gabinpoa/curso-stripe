import { notFound } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";
import CourseContentPageClient from "@/components/course-content/client-page";
import Fallback from "@/components/course-content/fallback";
import Header from "@/components/header";
import { getCourseFromFileSystem } from "@/lib/db/queries";
import CourseContentSidebarTrigger from "@/components/course-content/sidebar-trigger";

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
  return <CourseContentPageClient courseContent={courseContent} />;
}
