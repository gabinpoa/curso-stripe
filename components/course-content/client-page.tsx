"use client";
import { useEffect, useState } from "react";
import { SidebarInset } from "../ui/sidebar";
import { CourseContentMain } from "./main-content";
import { Lesson, Product } from "@/lib/fs/queries";
import { CourseContentSidebar } from "./sidebar";
import { getCompletedLessonsFromDb } from "@/lib/actions/course-load-actions";

export default function CourseContentPageClient({
  courseContent,
  updateCompletedLessonsOnDb,
}: {
  courseContent: Product;
  updateCompletedLessonsOnDb: (lessons: Lesson[]) => Promise<void>;
}) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(
    courseContent.modules[0].lessons[0]
  );
  const [courseDataState, setCourseDataState] =
    useState<Product>(courseContent);

  // Fetch completed lessons after mount
  useEffect(() => {
    async function fetchAndUpdateCompletedLessons() {
      const completedLessonIds = await getCompletedLessonsFromDb(
        courseContent.id
      );
      setCourseDataState((prev) => ({
        ...prev,
        modules: prev.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({
            ...lesson,
            completed: completedLessonIds.includes(lesson.id),
          })),
        })),
      }));
    }
    fetchAndUpdateCompletedLessons().catch((error) => {
      console.error("Failed to fetch completed lessons:", error);
    });
  }, [courseContent.id]);

  // Update selectedLesson when courseData changes to reflect completion status
  useEffect(() => {
    const allLessons = courseDataState.modules.flatMap(
      (module) => module.lessons
    );
    const updatedLesson = allLessons.find(
      (lesson) => lesson.id === selectedLesson.id
    );
    // Only update if the lesson reference actually changed
    if (updatedLesson && updatedLesson !== selectedLesson) {
      setSelectedLesson(updatedLesson);
    }
  }, [courseDataState, selectedLesson]);

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

  const handleLessonComplete = async (lessonId: string) => {
    setCourseDataState((prev) => {
      const updatedState = {
        ...prev,
        modules: prev.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) =>
            lesson.id === lessonId
              ? { ...lesson, completed: !lesson.completed }
              : lesson
          ),
        })),
      };
      updateCompletedLessonsOnDb(
        updatedState.modules.flatMap((module) => module.lessons)
      ).catch(() => {
        console.error("Failed to update completed lessons in DB");
      });
      return updatedState;
    });
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
