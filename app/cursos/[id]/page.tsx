import { notFound } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Suspense } from "react";
import CourseContentPageClient from "@/components/course-content/client-page";
import Fallback from "@/components/course-content/fallback";
import Header from "@/components/header";
import { getCourseFromFileSystem } from "@/lib/db/queries";

type Props = { params: Promise<{ id: string }> };
export default async function Page({ params }: Props) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <Header />
      </div>

      <SidebarProvider>
        <div className="flex h-[calc(100vh-theme(spacing.16))] w-full">
          <Suspense fallback={<Fallback />}>
            <CourseContentPage id={id} />
          </Suspense>
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
  console.log("Course content loaded:", courseContent.modules[1].lessons);
  console.log("Course content loaded:", courseContent.modules[0].lessons);
  return <CourseContentPageClient courseContent={courseContent} />;
}
