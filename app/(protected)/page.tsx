import { getCustomerBoughtProductsModules } from "@/lib/db/queries";
import CourseCard from "@/components/user-course-card";

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
    <div className="container mx-auto py-8 text-center h-full">
      <h1 className="text-3xl font-bold mb-6">Meus Cursos</h1>
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg text-gray-600">
          Você ainda não adquiriu nenhum curso.
        </p>
      </div>
    </div>
  );
}
