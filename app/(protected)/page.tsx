import { getCustomerBoughtProductsFromFileSystem } from "@/lib/db/queries";
import CourseCard from "@/components/user-course-card";
import { Suspense } from "react";
import { FALLBACK_THUMBNAIL } from "@/lib/fs/queries";

export default function PaginaMeusCursos() {
  return (
    <div className="container mx-auto mt-4 md:mt-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Meus Cursos</h1>
      <Suspense fallback={<LoadingFallback />}>
        <MeusCursosSection />
      </Suspense>
    </div>
  );
}

async function MeusCursosSection() {
  const boughtProductsWithModules =
    await getCustomerBoughtProductsFromFileSystem();

  if (!boughtProductsWithModules || boughtProductsWithModules.length === 0) {
    return <DoNotHaveAnyCourses />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {boughtProductsWithModules.map((course) => (
        <CourseCard
          key={course.id}
          id={course.id}
          thumbnails={[course.thumbnail]}
          modules={course.modules}
          description={null}
          name={course.name}
        />
      ))}
    </div>
  );
}

function DoNotHaveAnyCourses() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-lg text-gray-600">
        Você ainda não adquiriu nenhum curso.
      </p>
    </div>
  );
}

function LoadingFallback() {
  return (
    <CourseCard
      description="Carregando..."
      id="fallback"
      thumbnails={[FALLBACK_THUMBNAIL]}
      modules={[]}
      name="Carregando... "
      disabled={true}
    />
  );
}
