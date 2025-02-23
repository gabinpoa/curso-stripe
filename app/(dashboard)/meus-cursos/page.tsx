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
import { getExpandedCustomerValidSubscriptions } from '@/lib/payments/stripe';
import { getCustomerId, getProductsModulesPreview } from '@/lib/db/queries';

export default async function PaginaMeusCursos() {
  const customerId = await getCustomerId();

  const subscriptions = await getExpandedCustomerValidSubscriptions(customerId);

  const productsIds = subscriptions.map(
    (subscription) => subscription.product.id
  );

  const coursesModules = await getProductsModulesPreview(productsIds);

  const subscribedCourses = subscriptions.map((subscription) => {
    const product = subscription.product;
    const modules = coursesModules.filter(
      (module) => module.productId === product.id
    );
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      images: product.images,
      modules,
    };
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Meus Cursos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscribedCourses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </div>
    </div>
  );
}

interface CourseCardProps {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  modules: {
    id: number;
    productId: string;
    name: string;
    description: string | null;
    order: number;
    isExtraContent: boolean;
  }[];
}

function CourseCard(course: CourseCardProps) {
  return (
    <Card key={course.id} className="flex flex-col">
      <CardHeader className="items-center">
        <img
          src={course.images[0] || '/static/placeholder.png'}
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
