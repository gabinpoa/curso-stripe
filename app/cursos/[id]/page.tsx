import { getProductContentById, ProductContent } from "@/lib/db/queries";
import { MDXRemote } from "next-mdx-remote-client/rsc";
import CourseContent from "@/components/course-content";
import {
  DetailedHTMLProps,
  HTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
} from "react";
import { redirect } from "next/navigation";

const components = {
  h1: (
    props: DetailedHTMLProps<
      HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    >
  ) => <h1 className="text-2xl font-bold mb-4" {...props} />,
  h2: (
    props: DetailedHTMLProps<
      HTMLAttributes<HTMLHeadingElement>,
      HTMLHeadingElement
    >
  ) => <h2 className="text-xl font-semibold mb-3" {...props} />,
  p: (
    props: DetailedHTMLProps<
      HTMLAttributes<HTMLParagraphElement>,
      HTMLParagraphElement
    >
  ) => <p className="mb-4" {...props} />,
  ul: (
    props: DetailedHTMLProps<HTMLAttributes<HTMLUListElement>, HTMLUListElement>
  ) => <ul className="list-disc pl-5 mb-4" {...props} />,
  ol: (
    props: DetailedHTMLProps<
      OlHTMLAttributes<HTMLOListElement>,
      HTMLOListElement
    >
  ) => <ol className="list-decimal pl-5 mb-4" {...props} />,
  li: (
    props: DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>
  ) => <li className="mb-2" {...props} />,
  code: (
    props: DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
  ) => <code className="bg-gray-100 rounded p-1" {...props} />,
  pre: (
    props: DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>
  ) => (
    <pre className="bg-gray-100 rounded p-4 overflow-x-auto mb-4" {...props} />
  ),
};

function addMdxSourceToContent(content: ProductContent) {
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

  let courseContent = await getProductContentById(id);
  if ("message" in courseContent) {
    redirect("/cursos/" + id + "/visao-geral");
    console.error(courseContent);
  }
  courseContent = addMdxSourceToContent(courseContent);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <CourseContent courseData={courseContent} />
    </div>
  );
}
