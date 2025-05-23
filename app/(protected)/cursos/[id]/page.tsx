import { MDXRemote } from "next-mdx-remote-client/rsc";
import CourseContent from "@/components/course-content";
import { redirect } from "next/navigation";
import { CourseWithModulesWithLessons, getCourse } from "@/lib/db/queries";
import components from "@/components/mdx-components";

function addMdxSourceToContent(content: CourseWithModulesWithLessons) {
  const modules = content.modules.map((module) => {
    module.lessons = module.lessons.map((lesson) => {
      if (!lesson.content) {
        lesson.mdxComponent = (
          <MDXRemote
            source="## Conteúdo disponível apenas 7 dias apos o inicio do curso"
            components={components}
          />
        );
      } else if (lesson.contentType === "MDX") {
        lesson.mdxComponent = (
          <MDXRemote source={lesson.content} components={components} />
        );
      }
      return lesson;
    });
    return module;
  });
  content.modules = modules;
  return content;
}

type Props = { params: Promise<{ id: string }> };
export default async function Page({ params }: Props) {
  const { id } = await params;

  let courseContent = await getCourse(id);
  if (!courseContent) {
    redirect("/sign-in");
  }
  courseContent = addMdxSourceToContent(courseContent);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CourseContent courseData={courseContent} />
    </div>
  );
}
