"use client";
import { useEffect, useState } from "react";
import { SidebarInset } from "../ui/sidebar";
import { CourseContentMain } from "./main-content";
import { Lesson } from "@/lib/fs/queries";
import { CourseContentSidebar } from "./sidebar";
import { getCompletedLessonsFromDb } from "@/lib/actions/course-load-actions";
import { useCourseData } from "@/lib/context/course-data";

export default function CourseContentPageClient({
  courseId,
  updateCompletedLessonsOnDb,
}: {
  courseId: string;
  updateCompletedLessonsOnDb: (lessons: Lesson[]) => Promise<void>;
}) {
  const { courseData, setCourseData } = useCourseData();
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(
    courseData.modules[0].lessons[0]
  );

  // Fetch completed lessons after mount
  useEffect(() => {
    async function fetchAndUpdateCompletedLessons() {
      const completedLessonIds = await getCompletedLessonsFromDb(courseId);
      setCourseData((prev) => ({
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Update selectedLesson when courseData changes to reflect completion status
  useEffect(() => {
    const allLessons = courseData.modules.flatMap((module) => module.lessons);
    const updatedLesson = allLessons.find(
      (lesson) => lesson.id === selectedLesson.id
    );
    // Only update if the lesson reference actually changed
    if (updatedLesson && updatedLesson !== selectedLesson) {
      setSelectedLesson(updatedLesson);
    }
  }, [courseData, selectedLesson]);

  // Calculate overall progress
  const totalLessons = courseData.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  const completedLessons = courseData.modules.reduce(
    (total, module) =>
      total + module.lessons.filter((lesson) => lesson.completed).length,
    0
  );
  const progressPercentage = Math.round(
    (completedLessons / totalLessons) * 100
  );

  const handleLessonComplete = async (lessonId: string) => {
    setCourseData((prev) => {
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
        courseDataState={courseData}
        selectedLesson={selectedLesson}
        onLessonSelect={setSelectedLesson}
        onLessonComplete={handleLessonComplete}
        progressPercentage={progressPercentage}
      />
      <SidebarInset className="flex-1 overflow-hidden">
        <CourseContentMain
          courseData={courseData}
          selectedLesson={selectedLesson}
          onLessonComplete={handleLessonComplete}
          onLessonSelect={setSelectedLesson}
        />
      </SidebarInset>
    </>
  );
}
