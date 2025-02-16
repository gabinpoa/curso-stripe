import { getProductContentById } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote-client/rsc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import CourseContent from '@/components/course-content';

const components = {
  h1: (props: any) => <h1 className="text-2xl font-bold mb-4" {...props} />,
  h2: (props: any) => <h2 className="text-xl font-semibold mb-3" {...props} />,
  p: (props: any) => <p className="mb-4" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-5 mb-4" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-5 mb-4" {...props} />,
  li: (props: any) => <li className="mb-2" {...props} />,
  code: (props: any) => <code className="bg-gray-100 rounded p-1" {...props} />,
  pre: (props: any) => (
    <pre className="bg-gray-100 rounded p-4 overflow-x-auto mb-4" {...props} />
  ),
};

type ProductContent = Awaited<ReturnType<typeof getProductContentById>>;
export async function addMdxSourceToContent(content: ProductContent) {
  const modules = await Promise.all(
    content.modules.map(async (module) => {
      module.lessons = await Promise.all(
        module.lessons.map(async (lesson) => {
          if (!lesson.content) {
            lesson.mdxComponent = (
              <MDXRemote
                source="## Conteudo disponivel apenas 7 dias apos o inicio do curso"
                components={components}
              />
            );
          } else if (lesson.contentType === 'MDX') {
            lesson.mdxComponent = (
              <MDXRemote source={lesson.content} components={components} />
            );
          }
          return lesson;
        })
      );
      return module;
    })
  );

  content.modules = modules;
  return content;
}

type Props = { params: Promise<{ id: string }> };
export default async function Page({ params }: Props) {
  const { id } = await params;

  let courseContent;
  try {
    courseContent = await addMdxSourceToContent(
      await getProductContentById(id)
    );
  } catch (error) {
    console.error(error);
    redirect('/cursos/' + id + '/visao-geral');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CourseContent {...courseContent} />
      </div>
    </div>
  );
}
