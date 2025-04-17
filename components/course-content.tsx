"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lesson, ProductContent } from "@/lib/db/queries";

type Props = {
  courseData: ProductContent;
};
export default function CourseContent({ courseData }: Props) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(
    courseData.modules[0].lessons[0]
  );

  return (
    <>
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold mb-4">{courseData.name}</h1>
        <p className="text-gray-600 mb-4">{courseData.description}</p>
        {selectedLesson ? (
          <Card>
            <CardHeader>
              <CardTitle>{selectedLesson.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLesson.contentType === "VIDEO" ? (
                <div style={{ position: "relative", paddingTop: "56.25%" }}>
                  <iframe
                    src={
                      selectedLesson.content +
                      "autoplay=false&loop=false&muted=false&preload=true&responsive=true&rememberPosition=true"
                    }
                    loading="lazy"
                    style={{
                      border: 0,
                      position: "absolute",
                      top: 0,
                      height: "100%",
                      width: "100%",
                    }}
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                    allowFullScreen={true}
                  ></iframe>
                </div>
              ) : (
                <div className="prose max-w-none">
                  {selectedLesson.mdxComponent || null}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <img
            src={courseData.images[0] || "/static/placeholder.jpg"}
            alt={courseData.name}
            width={600}
            height={300}
            className="rounded-md object-cover"
          />
        )}
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Conteúdo do Curso</h2>
        <Accordion
          defaultValue="module-0"
          type="single"
          collapsible
          className="w-full"
        >
          {courseData.modules.map((module, moduleIndex) => (
            <AccordionItem value={`module-${moduleIndex}`} key={moduleIndex}>
              <AccordionTrigger>
                {module.name}
                {module.isExtraContent && (
                  <Badge variant="secondary" className="ml-2">
                    Extra
                  </Badge>
                )}
              </AccordionTrigger>
              <AccordionContent>
                {module.lessons.map((lesson, lessonIndex) => (
                  <Button
                    variant="ghost"
                    className="w-full justify-start focus:text-blue-900"
                    key={lessonIndex}
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    {lesson.name}
                  </Button>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </>
  );
}
