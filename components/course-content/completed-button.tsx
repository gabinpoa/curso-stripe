import { Lesson } from "@/lib/fs/queries";
import { Button } from "../ui/button";
import { Check } from "lucide-react";

export default function CompletedButton({
  selectedLesson,
  onLessonComplete,
}: {
  selectedLesson: Lesson;
  onLessonComplete: (lessonId: string) => void;
}) {
  return (
    <Button
      variant={selectedLesson.completed ? "secondary" : "default"}
      onClick={() => onLessonComplete(selectedLesson.id)}
      className="flex py-5 items-center gap-2 flex-shrink-0 text-sm w-full sm:w-auto"
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
