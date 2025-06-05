"use client";
import { CourseContentSidebar } from "./sidebar";
import { SidebarInset } from "../ui/sidebar";
import { CourseContentMain } from "./main-content";
import { Product } from "@/lib/fs/queries";

export default function Fallback() {
  const courseData: Product = {
    id: "",
    name: "Carregando...",
    thumbnail: "/static/placeholder.jpg",
    modules: [
      {
        id: "1",
        name: "Carregando...",
        order: 0,
        isExtra: false, // FS type property
        lessons: [
          {
            id: "1",
            name: "Carregando...",
            order: 0,
            type: "html",
            htmlContent: "",
            completed: false,
          },
        ],
      },
    ],
  };
  return (
    <>
      <CourseContentSidebar
        courseDataState={courseData}
        selectedLesson={courseData.modules[0].lessons[0]}
        onLessonSelect={() => {}}
        onLessonComplete={() => {}}
        progressPercentage={0}
      />
      <SidebarInset className="flex-1">
        <CourseContentMain
          courseData={courseData}
          selectedLesson={courseData.modules[0].lessons[0]}
          onLessonSelect={() => {}}
          onLessonComplete={() => {}}
        />
      </SidebarInset>
    </>
  );
}
