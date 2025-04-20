import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Target, Zap, TrendingUp } from "lucide-react";
import { getExpandedProductsWithPrices } from "@/lib/payments/stripe";
import { siteName, subject } from "@/lib/utils";
import AuthButton from "./(dashboard)/auth-button";
import { getCustomerBoughtProductsIds, getUser } from "@/lib/db/queries";
import FeaturedCourses from "@/components/featured-courses";
import UserHeaderMenu from "@/components/user-header-menu";

export default async function PaginaInicial() {
  const [user, productsWithPrices, customerBoughtProductsIds] =
    await Promise.all([
      getUser(),
      getExpandedProductsWithPrices(),
      getCustomerBoughtProductsIds(),
    ]);
  const userLoggedIn = user !== null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto py-6">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              {siteName}
            </Link>
            <div className="gap-4 flex items-center">
              <AuthButton
                userLoggedIn={userLoggedIn}
                variant="secondary"
                className="bg-neutral-200"
              />
              <Link href="#cursos" className="hover:underline">
                Cursos
              </Link>
              {userLoggedIn && <UserHeaderMenu email={user.email} />}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-b from-primary to-background py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Domine o {subject} com {siteName}
            </h1>
            <p className="text-xl mb-8">
              Aprenda estratégias comprovadas de Google Ads, marketing digital e
              ferramentas no-code
            </p>
            <Button size="lg" asChild>
              <Link href="#cursos">Explorar Cursos</Link>
            </Button>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Por que Aprender com {siteName}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card>
                <CardHeader>
                  <Rocket className="w-12 h-12 mb-4 text-primary" />
                  <CardTitle>Experiência Comprovada</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Mais de 10 anos de experiência em {subject} e {subject}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Target className="w-12 h-12 mb-4 text-primary" />
                  <CardTitle>Resultados Reais</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Cases de sucesso com clientes de diversos segmentos</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="w-12 h-12 mb-4 text-primary" />
                  <CardTitle>Conteúdo Atualizado</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Cursos sempre atualizados com as últimas tendências e
                    ferramentas
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <TrendingUp className="w-12 h-12 mb-4 text-primary" />
                  <CardTitle>Foco em Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Aprenda estratégias práticas para impulsionar seu negócio
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="cursos" className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Cursos em Destaque
            </h2>
            <FeaturedCourses
              userSubscriptionsProductsIds={customerBoughtProductsIds || []}
              productsWithPrices={productsWithPrices}
            />
          </div>
        </section>

        <section className="py-16 bg-background text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Pronto para Impulsionar Seu {subject}?
            </h2>
            <p className="text-xl mb-8">
              Junte-se a centenas de alunos que já transformaram seus negócios
            </p>
            <Button size="lg" asChild>
              <Link href="#cursos">Comece Agora</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>
              &copy; 2025 {siteName} - {subject} . Todos os direitos reservados.
            </p>
            <nav className="space-x-4 mt-4 md:mt-0">
              <Link href="/termos" className="hover:underline">
                Termos de Serviço
              </Link>
              <Link href="/privacidade" className="hover:underline">
                Política de Privacidade
              </Link>
              <Link href="/contato" className="hover:underline">
                Fale Conosco
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
