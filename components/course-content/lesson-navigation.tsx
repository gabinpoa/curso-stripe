import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Lesson } from "@/lib/fs/queries";
import { NavigationButton } from "./navigation-button";

interface LessonNavigationProps {
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
  currentIndex: number;
  allLessonsLength: number;
  onPrevious: () => void;
  onNext: () => void;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({
  previousLesson,
  nextLesson,
  currentIndex,
  allLessonsLength,
  onPrevious,
  onNext,
}) => (
  <div className="w-full pb-1 px-2 max-w-[100vw] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
    <NavigationButton
      disabled={!previousLesson}
      onClick={onPrevious}
      className="flex items-center gap-2 md:flex-1 min-w-0"
      type="button"
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
    </NavigationButton>

    <div className="text-xs md:text-sm text-muted-foreground text-center py-2 sm:py-0">
      Aula {currentIndex + 1} de {allLessonsLength}
    </div>

    <NavigationButton
      disabled={!nextLesson}
      onClick={onNext}
      className="flex items-center gap-2 md:flex-1 min-w-0"
      type="button"
    >
      <span className="truncate">
        {nextLesson ? (
          <span className="hidden sm:inline">Próxima: {nextLesson.name}</span>
        ) : (
          "Próxima Aula"
        )}
        <span className="sm:hidden">
          {nextLesson ? `${nextLesson.name} →` : "Próxima →"}
        </span>
      </span>
      <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
    </NavigationButton>
  </div>
);
