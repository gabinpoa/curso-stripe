import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getCustomerBoughtProductsModules } from "@/lib/db/queries";
import Image from "next/image";

export default async function PaginaMeusCursos() {
  const boughtProductsWithModules = await getCustomerBoughtProductsModules();

  if (!boughtProductsWithModules || boughtProductsWithModules.length === 0) {
    return <DoNotHaveAnyCourses />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Meus Cursos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boughtProductsWithModules.map((course) => (
          <CourseCard
            key={course.id}
            description={course.description}
            id={course.id}
            images={[course.thumbnail]}
            modules={course.modules}
            name={course.name}
          />
        ))}
      </div>
    </div>
  );
}

function DoNotHaveAnyCourses() {
  return (
    <div className="container mx-auto py-8 text-center">
      <h1 className="text-3xl font-bold mb-6">Meus Cursos</h1>
      <p className="text-lg text-gray-600">
        Você ainda não adquiriu nenhum curso.
      </p>
      <Link href="/#cursos" passHref>
        <Button className="mt-4">Ver Cursos</Button>
      </Link>
    </div>
  );
}

interface CourseCardProps {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  modules: {
    id: string;
    description?: string | null;
    name: string;
    order: number;
    isExtraContent: boolean;
  }[];
}

function CourseCard(course: CourseCardProps) {
  return (
    <Card key={course.id} className="flex flex-col">
      <CardHeader className="items-center">
        <Image
          src={course.images[0] || "/static/placeholder.png"}
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
