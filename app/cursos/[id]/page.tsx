import { getProductContentById } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import { evaluate, MDXRemote } from 'next-mdx-remote-client/rsc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

type Props = { params: Promise<{ id: string }> };

type ProductContent = Awaited<ReturnType<typeof getProductContentById>>;

export async function addMdxSourceToContent(content: ProductContent) {
  const modules = await Promise.all(
    content.modules.map(async (module) => {
      module.lessons = await Promise.all(
        module.lessons.map(async (lesson) => {
          if (lesson.contentType === 'MDX' && lesson.content) {
            const mdxSource = await evaluate({ source: lesson.content });
            lesson.mdxSource = mdxSource;
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
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{courseContent.name}</h1>
          <p className="text-gray-600 mb-4">{courseContent.description}</p>
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo do Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {courseContent.modules.map((module, moduleIndex) => (
                  <AccordionItem
                    value={`module-${moduleIndex}`}
                    key={moduleIndex}
                  >
                    <AccordionTrigger>
                      {module.name}
                      {module.isExtraContent && (
                        <Badge variant="secondary" className="ml-2">
                          Extra
                        </Badge>
                      )}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <li key={lessonIndex}>
                            <h3 className="font-semibold">{lesson.name}</h3>
                            {lesson.contentType === 'VIDEO' ? (
                              <div className="aspect-w-16 aspect-h-9 mt-2">
                                <iframe
                                  src={lesson.content}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="w-full h-full"
                                ></iframe>
                              </div>
                            ) : (
                              <div className="prose max-w-none mt-2">
                                {lesson.mdxSource && lesson.content ? (
                                  <MDXRemote
                                    source={lesson.content}
                                    components={components}
                                  />
                                ) : (
                                  <div>{lesson.content}</div>
                                )}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Image
                src={courseContent.metadata.thumbnail_url || '/placeholder.svg'}
                alt={courseContent.name}
                width={300}
                height={200}
                className="rounded-md object-cover"
              />
            </CardHeader>
            <CardContent>
              <h2 className="text-xl font-bold mb-2">{courseContent.name}</h2>
              <p className="text-gray-600">{courseContent.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
