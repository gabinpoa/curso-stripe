"use client";
import { useCourseData } from "@/lib/context/course-data";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";

export default function CourseContentSidebarTrigger() {
  const { open, isMobile } = useSidebar();
  const { courseData } = useCourseData();
  return (
    (isMobile || !open) && (
      <SidebarTrigger
        className={`w-fit px-5 py-4 ${
          courseData.colors?.["bg-botao-sidebar"]
            ? courseData.colors["bg-botao-sidebar"]
            : "bg-zenite-button-neutral"
        } text-primary-foreground rounded-r-md rounded-l-none shadow-sm shadow-black/30`}
      >
        Menu
      </SidebarTrigger>
    )
  );
}
