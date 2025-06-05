"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Check, Play, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Lesson, Product } from "@/lib/fs/queries";

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
      // Scroll to top when changing lessons
      window.scrollTo(0, 0);
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      onLessonSelect(nextLesson);
      // Scroll to top when changing lessons
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Lesson Header */}
      <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b px-3 md:px-6 bg-white">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedLesson.type === "video" ? (
            <Play className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
          ) : (
            <FileText className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
          )}
          <h1
            className="font-medium md:font-semibold text-sm md:text-base truncate"
            title={selectedLesson.name}
          >
            {selectedLesson.name}
          </h1>
          {selectedLesson.completed && (
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-700 flex-shrink-0 text-xs"
            >
              <Check className="w-2 h-2 md:w-3 md:h-3 mr-1" />
              <span className="hidden sm:inline">Concluído</span>
              <span className="sm:hidden">✓</span>
            </Badge>
          )}
        </div>
      </header>

      {/* Main Content Area - Properly Centered */}
      <main className="flex-1 overflow-auto flex justify-center">
        <div className="w-full max-w-4xl mx-auto px-3 md:px-6 py-3 md:py-6">
          <Card className="mb-4 md:mb-6">
            <CardHeader className="p-3 md:p-6 pb-2 md:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <CardTitle className="text-lg md:text-2xl flex-1 min-w-0 leading-tight">
                  {selectedLesson.name}
                </CardTitle>
                <Button
                  variant={selectedLesson.completed ? "secondary" : "default"}
                  onClick={() => onLessonComplete(selectedLesson.id)}
                  className="flex items-center gap-2 flex-shrink-0 text-sm w-full sm:w-auto"
                  size="sm"
                >
                  {selectedLesson.completed ? (
                    <>
                      <Check className="w-3 h-3 md:w-4 md:h-4" />
                      Concluído
                    </>
                  ) : (
                    "Marcar como Concluído"
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              {selectedLesson.type === "video" ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={`${selectedLesson.videoUrl}?autoplay=false&loop=false&muted=false&preload=true&responsive=true&rememberPosition=true`}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                    allowFullScreen={true}
                  />
                </div>
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedLesson.htmlContent || "",
                  }}
                  className="prose prose-sm md:prose max-w-none"
                ></div>
              )}
            </CardContent>
          </Card>

          {/* Navigation - Mobile optimized */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <Button
              variant="outline"
              disabled={!previousLesson}
              onClick={handlePreviousLesson}
              className="flex items-center gap-2 text-xs md:text-sm"
              size="sm"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="truncate">
                {previousLesson ? (
                  <span className="hidden sm:inline">
                    Anterior: {previousLesson.name}
                  </span>
                ) : (
                  "Aula Anterior"
                )}
                <span className="sm:hidden">
                  {previousLesson ? `← ${previousLesson.name}` : "← Anterior"}
                </span>
              </span>
            </Button>

            <div className="text-xs md:text-sm text-muted-foreground text-center py-2 sm:py-0">
              Aula {currentIndex + 1} de {allLessons.length}
            </div>

            <Button
              variant="outline"
              disabled={!nextLesson}
              onClick={handleNextLesson}
              className="flex items-center gap-2 text-xs md:text-sm"
              size="sm"
            >
              <span className="truncate">
                {nextLesson ? (
                  <span className="hidden sm:inline">
                    Próxima: {nextLesson.name}
                  </span>
                ) : (
                  "Próxima Aula"
                )}
                <span className="sm:hidden">
                  {nextLesson ? `${nextLesson.name} →` : "Próxima →"}
                </span>
              </span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
