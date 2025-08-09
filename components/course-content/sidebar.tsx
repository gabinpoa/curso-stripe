"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  Circle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Lesson, Product } from "@/lib/fs/queries";

interface CourseContentSidebarProps {
  courseDataState: Product;
  selectedLesson: Lesson;
  onLessonSelect: (lesson: Lesson) => void;
  onLessonComplete: (lessonId: string) => void;
  progressPercentage: number;
}

export function CourseContentSidebar({
  courseDataState: courseData,
  selectedLesson,
  onLessonSelect,
  onLessonComplete,
  progressPercentage,
}: CourseContentSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(["1"])
  );
  const { setOpenMobile, setOpen, isMobile } = useSidebar();

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleLessonSelect = (lesson: Lesson) => {
    onLessonSelect(lesson);
    setOpenMobile(false); // Close sidebar on lesson select in mobile view
  };

  return (
    <Sidebar variant="sidebar" collapsible="offcanvas" className="border-r">
      <SidebarHeader className="px-4 py-6 md:py-8 md:px-6 border-b md:mt-[57px] relative">
        <button
          type="button"
          onClick={() => (isMobile ? setOpenMobile(false) : setOpen(false))}
          className="absolute right-4 top-4 z-10 p-2 rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Fechar menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="space-y-4">
          <div>
            <h2
              className={`font-semibold ${
                courseData.colors?.["texto-header"]
                  ? courseData.colors["texto-header"]
                  : "text-zenite-primary-neutral"
              } text-lg line-clamp-2 leading-tight`}
              title={courseData.name}
            >
              {courseData.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Progresso do Curso
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {progressPercentage}% concluído
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0">
              {courseData.modules.map((module) => {
                const isExpanded = expandedModules.has(module.id);
                const moduleProgress = module.lessons.filter(
                  (l) => l.completed
                ).length;
                const totalLessons = module.lessons.length;

                return (
                  <SidebarMenuItem
                    key={module.id}
                    className="border-b border-border/50"
                  >
                    <Collapsible
                      open={isExpanded}
                      onOpenChange={() => toggleModule(module.id)}
                    >
                      {/* Module Header */}
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between p-4 hover:bg-accent h-auto min-h-[56px] rounded-none">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <div className="font-medium text-base leading-tight line-clamp-2">
                                {module.name}
                              </div>
                              {module.isExtra && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs mt-1"
                                >
                                  Bônus
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm text-muted-foreground">
                              {moduleProgress}/{totalLessons}
                            </span>
                            {moduleProgress === totalLessons && (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>

                      {/* Module Lessons */}
                      <CollapsibleContent>
                        <div className="bg-muted/30">
                          {module.lessons.map((lesson, index) => (
                            <div
                              key={lesson.id}
                              className={`flex items-center border-l-2 ${
                                selectedLesson.id === lesson.id
                                  ? "border-primary bg-primary/5"
                                  : "border-muted-foreground/20"
                              }`}
                            >
                              {/* Progress Indicator Line */}
                              <div className="flex flex-col items-center py-2 px-4">
                                <button
                                  onClick={() => onLessonComplete(lesson.id)}
                                  className="flex-shrink-0 hover:scale-110 transition-transform"
                                >
                                  {lesson.completed ? (
                                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                                      <Check className="w-3 h-3 text-white" />
                                    </div>
                                  ) : (
                                    <Circle className="w-5 h-5 text-muted-foreground hover:text-green-500 transition-colors" />
                                  )}
                                </button>
                                {/* Connecting line to next lesson */}
                                {index < module.lessons.length - 1 && (
                                  <div className="w-px h-8 bg-muted-foreground/20 mt-2" />
                                )}
                              </div>

                              {/* Lesson Content */}
                              <button
                                onClick={() => handleLessonSelect(lesson)}
                                className={`flex-1 flex items-center gap-3 p-3 text-left hover:bg-accent/50 transition-colors min-h-[48px] ${
                                  selectedLesson.id === lesson.id
                                    ? "bg-primary/5"
                                    : ""
                                }`}
                              >
                                <div className="flex items-center flex-1 min-w-0">
                                  <div className="flex-1 min-w-0 space-y-1">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="text-sm font-medium line-clamp-2 leading-tight">
                                            {lesson.name}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent
                                          side="right"
                                          className="max-w-[300px]"
                                        >
                                          {lesson.name}
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <div className="flex items-center gap-1">
                                      {lesson.type === "video" ? (
                                        <Play className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                      ) : (
                                        <FileText className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                                      )}
                                      <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide">
                                        {lesson.type === "video"
                                          ? "VÍDEO"
                                          : "TEXTO"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
