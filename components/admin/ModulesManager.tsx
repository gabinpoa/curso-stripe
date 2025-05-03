import { Module } from "./course-form-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

type ModulesManagerProps = {
  modules: Module[];
  onAddModule: () => void;
  onUpdateModule: (index: number, data: Partial<Module>) => void;
  onRemoveModule: (index: number) => void;
};

export function ModulesManager({
  modules,
  onAddModule,
  onUpdateModule,
  onRemoveModule,
}: ModulesManagerProps) {
  const reorderLessons = (
    moduleIndex: number,
    lessonIndex: number,
    direction: "up" | "down"
  ) => {
    const updatedModules = [...modules];
    const lessons = [...updatedModules[moduleIndex].lessons];

    if (direction === "up" && lessonIndex > 0) {
      [lessons[lessonIndex - 1], lessons[lessonIndex]] = [
        lessons[lessonIndex],
        lessons[lessonIndex - 1],
      ];
    } else if (direction === "down" && lessonIndex < lessons.length - 1) {
      [lessons[lessonIndex], lessons[lessonIndex + 1]] = [
        lessons[lessonIndex + 1],
        lessons[lessonIndex],
      ];
    }

    // Update the order property for all lessons
    lessons.forEach((lesson, index) => {
      lesson.order = index + 1;
    });

    updatedModules[moduleIndex].lessons = lessons;
    onUpdateModule(moduleIndex, { lessons });
  };

  return (
    <div className="space-y-6">
      {modules.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          No modules added yet. Click &quot;Add Module&quot; to get started.
        </p>
      )}

      {modules.map((module, moduleIndex) => (
        <div key={module.id} className="border p-4 rounded-md">
          <div className="flex items-center justify-between">
            <Input
              placeholder="Module Name"
              value={module.title}
              onChange={(e) =>
                onUpdateModule(moduleIndex, { title: e.target.value })
              }
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveModule(moduleIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            placeholder="Module Description"
            value={module.description}
            onChange={(e) =>
              onUpdateModule(moduleIndex, { description: e.target.value })
            }
            className="mt-2"
          />
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Lessons</h4>
            {module.lessons.map((lesson, lessonIndex) => (
              <div key={lesson.id} className="flex items-center space-x-2">
                <Input
                  placeholder="Lesson Name"
                  value={lesson.name}
                  onChange={(e) =>
                    onUpdateModule(moduleIndex, {
                      lessons: module.lessons.map((l, i) =>
                        i === lessonIndex ? { ...l, name: e.target.value } : l
                      ),
                    })
                  }
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => reorderLessons(moduleIndex, lessonIndex, "up")}
                  disabled={lessonIndex === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    reorderLessons(moduleIndex, lessonIndex, "down")
                  }
                  disabled={lessonIndex === module.lessons.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button onClick={onAddModule} size="sm">
        <Plus className="h-4 w-4 mr-2" />
        Add Module
      </Button>
    </div>
  );
}
