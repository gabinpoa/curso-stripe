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
import { SubmitButton } from '@/components/submit-button';
import { checkoutAction } from '@/lib/payments/actions';
import {
  cookiesClient,
  fetchUserAttributesServer,
} from '@/utils/amplify-utils';
import {
  getCoursePreview,
  getPreviewModules,
  getSubscriptionData,
} from '@/lib/queries';

type Props = { params: Promise<{ id: string }> };
export default async function Page({ params }: Props) {
  const { id } = await params;

  const coursePreview = await getCoursePreview(id);
  if (!coursePreview) return <div>Course not found</div>;
  const modules = coursePreview.modules;

  modules.sort((a, b) => a.order - b.order);
  modules.forEach((module) => {
    module.lessons.sort((a, b) => a.order - b.order);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-3xl font-bold mb-4">{coursePreview.name}</h1>
        {coursePreview.description && (
          <p className="text-gray-600 mb-4">{coursePreview.description}</p>
        )}
        {coursePreview.description && (
          <p className="text-gray-600 mb-4">{coursePreview.description}</p>
        )}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detalhes do Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="font-semibold">Preço</dt>
                <dd>R$ {coursePreview.priceUnitAmount / 100}</dd>
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
              {modules.map((module, moduleIndex) => (
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
                        <li key={lessonIndex} className="flex justify-between">
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
              src={coursePreview.image || '/static/placeholder.png'}
              alt={coursePreview.name}
              width={300}
              height={200}
              className="rounded-md object-cover"
            />
          </CardHeader>
          <CardContent>
            <CardTitle className="mb-2">
              R$ {coursePreview.priceUnitAmount / 100}
            </CardTitle>
            <CardDescription className="mb-4">
              Obtenha acesso instantâneo a este curso
            </CardDescription>
            <form action={checkoutAction}>
              <input
                type="hidden"
                name="priceId"
                value={coursePreview.priceId}
              />
              <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
