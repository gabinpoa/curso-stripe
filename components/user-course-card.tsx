import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';

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

export default function CourseCard(course: CourseCardProps) {
  return (
    <Card key={course.id} className="flex flex-col">
      <CardHeader className="items-center">
        <Image
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
