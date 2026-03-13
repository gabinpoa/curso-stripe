import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/main-card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Thumbnail } from "@/lib/fs/queries";

interface CourseCardProps {
  id: string;
  name: string;
  description: string | null;
  thumbnails: [Thumbnail];
  modules: {
    id: string;
    description?: string | null;
    name: string;
    order: number;
    isExtra: boolean;
  }[];
  disabled?: boolean;
}

export default function CourseCard(course: CourseCardProps) {
  function getImageSrc(thumbnail: Thumbnail): string {
    switch (thumbnail.origin) {
      case "filesystem":
        return new URL(`/product/${course.id}/${thumbnail.path}`, process.env.NEXT_PUBLIC_BASE_URL).href;
      case "names":
        return thumbnail.path;
    } 
  }
  return (
    <Card key={course.id} className="flex flex-col">
      <CardHeader className="items-center justify-center">
          <Image
            src={getImageSrc(course.thumbnails[0])}
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
              {module.isExtra && <Badge variant="secondary">Extra</Badge>}
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/cursos/${course.id}`} passHref className="w-full">
          <Button disabled={!!course.disabled} className="w-full">
            Acessar Curso
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
