"use client";

import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/main-card";
import { useSidebar } from "@/components/ui/sidebar";
import { Lesson, Product } from "@/lib/fs/queries";
import { LessonNavigation } from "./lesson-navigation";
import CompletedButton from "./completed-button";

interface CourseContentMainProps {
  courseData: Product;
  selectedLesson: Lesson;
  onLessonComplete: (lessonId: string) => void;
  onLessonSelect: (lesson: Lesson) => void;
}

export function CourseContentMain({
  courseData,
  selectedLesson,
  onLessonComplete,
  onLessonSelect,
}: CourseContentMainProps) {
  const { open } = useSidebar();

  // Find current lesson index for navigation
  const allLessons = courseData.modules.flatMap((module) => module.lessons);
  const currentIndex = allLessons.findIndex(
    (lesson) => lesson.id === selectedLesson.id
  );
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const handlePreviousLesson = () => {
    if (previousLesson) {
      onLessonSelect(previousLesson);
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      onLessonSelect(nextLesson);
    }
  };

  // Scroll to top when lesson changes (including from sidebar)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedLesson.id]);

  return (
    <div className="flex flex-col h-full pb-12">
      {/* Main Content Area - Properly Centered */}
      <div className="flex-1 overflow-auto flex justify-center">
        <div
          className={
            "w-full max-w-5xl mx-auto sm:px-3 mt-4" + (!open ? " md:px-6 " : "")
          }
        >
          <Card
            className={`flex-1 p-2 md:p-6 mb-4 md:mb-6 ${
              courseData.colors?.["bg-conteudo"]
                ? courseData.colors["bg-conteudo"]
                : "bg-zenite-background-light-neutral"
            }`}
          >
            <CardHeader className="pt-2 md:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <CardTitle className="text-lg md:text-2xl flex-1 min-w-0 leading-tight">
                  {selectedLesson.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 max-w-full">
              {selectedLesson.type === "video" ? (
                <div style={{ position: "relative", paddingTop: "56.25%" }}>
                  <iframe
                    src={`${selectedLesson.videoUrl}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
                    loading="lazy"
                    style={{
                      border: 0,
                      position: "absolute",
                      top: 0,
                      height: "100%",
                      width: "100%",
                    }}
                    allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
                    allowFullScreen={true}
                  ></iframe>
                </div>
              ) : (
                <div
                  className="lesson-content max-w-full"
                  dangerouslySetInnerHTML={{
                    __html: selectedLesson.htmlContent || "",
                  }}
                />
              )}
            </CardContent>
            <CardFooter>
              <CompletedButton
                selectedLesson={selectedLesson}
                onLessonComplete={onLessonComplete}
              />
            </CardFooter>
          </Card>

          {/* Navigation - Mobile optimized */}
          <LessonNavigation
            previousLesson={previousLesson}
            nextLesson={nextLesson}
            currentIndex={currentIndex}
            allLessonsLength={allLessons.length}
            onPrevious={handlePreviousLesson}
            onNext={handleNextLesson}
          />
        </div>
      </div>
    </div>
  );
}
