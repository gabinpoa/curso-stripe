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
      className="flex py-5 items-center gap-2 flex-shrink-0 text-sm w-full sm:w-auto bg-zenite-button-neutral text-zenite-background-light-neutral"
      style={{
        backgroundColor: courseData.colors?.["bg-botao-concluido"] || undefined,
        color: courseData.colors?.["texto-botao-concluido"] || undefined,
      }}
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
