import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { getProductPreviewById } from '@/lib/db/queries';
import { SubmitButton } from '@/app/(dashboard)/precos/submit-button';
import { checkoutAction } from '@/lib/payments/actions';

type Props = { params: Promise<{ id: string }> };
export default async function Page({ params }: Props) {
  const { id } = await params;
  const courseData = await getProductPreviewById(id);

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{courseData.name}</h1>
          {courseData.description && (
            <p className="text-gray-600 mb-4">{courseData.description}</p>
          )}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Detalhes do Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courseData.metadata.instructor && (
                  <div>
                    <dt className="font-semibold">Instrutor</dt>
                    <dd>{courseData.metadata.instructor}</dd>
                  </div>
                )}
                {courseData.metadata.duration && (
                  <div>
                    <dt className="font-semibold">Duração</dt>
                    <dd>{courseData.metadata.duration}</dd>
                  </div>
                )}
                {courseData.metadata.level && (
                  <div>
                    <dt className="font-semibold">Nível</dt>
                    <dd>{courseData.metadata.level}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold">Preço</dt>
                  <dd>R$ {courseData.price.unitAmount / 100}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Conteúdo do Curso</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {courseData.modules.map((module, moduleIndex) => (
                  <AccordionItem
                    value={`modulo-${moduleIndex}`}
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
                          <li
                            key={lessonIndex}
                            className="flex justify-between"
                          >
                            <span>{lesson.name}</span>
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
              <img
                src={courseData.images[0] || '/static/placeholder.png'}
                alt={courseData.name}
                width={300}
                height={200}
                className="rounded-md object-cover"
              />
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">
                R$ {courseData.price.unitAmount / 100}
              </CardTitle>
              <CardDescription className="mb-4">
                Obtenha acesso instantâneo a este curso
              </CardDescription>
              <form action={checkoutAction}>
                <input
                  type="hidden"
                  name="priceId"
                  value={courseData.defaultPriceId}
                />
                <SubmitButton />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
