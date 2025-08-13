import { Lesson } from "@/lib/fs/queries";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import { useCourseData } from "@/lib/context/course-data";

export default function CompletedButton({
  selectedLesson,
  onLessonComplete,
}: {
  selectedLesson: Lesson;
  onLessonComplete: (lessonId: string) => void;
}) {
  const { courseData } = useCourseData();
  return (
    <Button
      variant={selectedLesson.completed ? "secondary" : "zenite"}
      onClick={() => onLessonComplete(selectedLesson.id)}
      className={`flex py-5 items-center gap-2 flex-shrink-0 text-sm w-full sm:w-auto ${
        courseData.colors?.["bg-botao-concluido"]
          ? `bg-[${courseData.colors["bg-botao-concluido"]}]`
          : "bg-zenite-button-neutral"
      } ${
        courseData.colors?.["texto-botao-concluido"]
          ? `text-[${courseData.colors["texto-botao-concluido"]}]`
          : "text-zenite-background-light-neutral"
      }`}
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
  );
}
