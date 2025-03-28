import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  cookiesClient,
  fetchUserAttributesServer,
} from '@/utils/amplify-utils';
import { redirect } from 'next/navigation';

export default async function PaginaMeusCursos() {
  const userAttributes = await fetchUserAttributesServer();
  if (!userAttributes) {
    console.error('Cannot get user attributes');
    redirect('/login');
  }

  const customerId = userAttributes['custom:customer_id'];
  if (!customerId) {
    console.error('Customer ID not found');
    redirect('/login');
  }

  const { data: subscriptions } =
    await cookiesClient.models.CourseSubscription.listCourseSubscriptionByCustomerIdAndStatus(
      {
        customerId,
        status: {
          between: ['active', 'trialing'],
        },
      },
      {
        selectionSet: [
          'course.productId',
          'course.name',
          'course.description',
          'course.image',
          'course.modules.*',
        ],
        authMode: 'userPool',
      }
    );

  const subscribedCourses = subscriptions.map((subscription) => ({
    ...subscription.course,
    id: subscription.course.productId,
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Meus Cursos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscribedCourses.length === 0 ? (
          <NotSubscribedToAnyCourse />
        ) : (
          subscribedCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))
        )}
      </div>
    </div>
  );
}

function NotSubscribedToAnyCourse() {
  return (
    <>
      <p className="text-lg text-gray-600">
        Você ainda não se inscreveu em nenhum curso.
      </p>
      <Link href="/#cursos" passHref>
        <Button className="mt-4">Ver Cursos</Button>
      </Link>
    </>
  );
}

interface CourseCardProps {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  modules: {
    id: number | string;
    name: string;
    description: string | null;
    order: number;
    isExtraContent: boolean | null;
  }[];
}

function CourseCard(course: CourseCardProps) {
  return (
    <Card key={course.id} className="flex flex-col">
      <CardHeader className="items-center">
        <img
          src={course.image || '/static/placeholder.png'}
          alt={course.name}
          width={300}
          height={150}
          className="rounded-md object-cover "
        />
      </CardHeader>
      <CardContent className="flex-grow">
        <CardTitle className="mb-2">{course.name}</CardTitle>
        <p className="text-sm text-gray-600 mb-4">{course.description}</p>
        <div className="space-y-2">
          {course.modules.map((module, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm">{module.name}</span>
              {module.isExtraContent && (
                <Badge variant="secondary">Extra</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/cursos/${course.id}`} passHref className="w-full">
          <Button className="w-full">Acessar Curso</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
