"use client";
import { useEffect, useState } from "react";
import { SidebarInset } from "../ui/sidebar";
import { CourseContentMain } from "./main-content";
import { Lesson, Product } from "@/lib/fs/queries";
import { CourseContentSidebar } from "./sidebar";

export default function CourseContentPageClient({
  courseContent,
}: {
  courseContent: Product;
}) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(
    courseContent.modules[0].lessons[0]
  );
  const [courseDataState, setCourseDataState] =
    useState<Product>(courseContent);

  // Update selectedLesson when courseData changes to reflect completion status
  useEffect(() => {
    const allLessons = courseDataState.modules.flatMap(
      (module) => module.lessons
    );
    const updatedLesson = allLessons.find(
      (lesson) => lesson.id === selectedLesson.id
    );
    if (updatedLesson) {
      setSelectedLesson(updatedLesson);
    }
  }, [courseDataState, selectedLesson.id]);

  // Calculate overall progress
  const totalLessons = courseDataState.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const completedLessons = courseDataState.modules.reduce(
    (total, module) =>
      total + module.lessons.filter((lesson) => lesson.completed).length,
    0
  );
  const progressPercentage = Math.round(
    (completedLessons / totalLessons) * 100
  );

  const handleLessonComplete = (lessonId: string) => {
    setCourseDataState((prev) => ({
      ...prev,
      modules: prev.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) =>
          lesson.id === lessonId
            ? { ...lesson, completed: !lesson.completed }
            : lesson
        ),
      })),
    }));
  };

  return (
    <>
      <CourseContentSidebar
        courseDataState={courseDataState}
        selectedLesson={selectedLesson}
        onLessonSelect={setSelectedLesson}
        onLessonComplete={handleLessonComplete}
        progressPercentage={progressPercentage}
      />
      <SidebarInset className="flex-1 overflow-hidden">
        <CourseContentMain
          courseData={courseDataState}
          selectedLesson={selectedLesson}
          onLessonComplete={handleLessonComplete}
          onLessonSelect={setSelectedLesson}
        />
      </SidebarInset>
    </>
  );
}
