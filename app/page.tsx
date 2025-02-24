import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Rocket, Target, Zap, TrendingUp } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { instructorName, siteName, subject } from '@/lib/utils';
import AuthButton from './(dashboard)/auth-button';
import { getUser } from '@/lib/db/queries';
import { checkoutAction } from '@/lib/payments/actions';
import { SubmitButton } from '@/components/submit-button';

export default async function PaginaInicial() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);
  const userLoggedIn = (await getUser()) !== null;
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground">
        <div className="container mx-auto py-6">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">
              {siteName}
            </Link>
            <div className="space-x-4">
              <AuthButton
                userLoggedIn={userLoggedIn}
                variant="secondary"
                className="bg-neutral-200"
              />
              <Link href="#cursos" className="hover:underline">
                Cursos
              </Link>
              {userLoggedIn && (
                <Link href="/dashboard" className="hover:underline">
                  Configurações
                </Link>
              )}
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
              <Link href="/cursos">Explorar Cursos</Link>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <CourseCard
                  key={product.id}
                  product={product}
                  prices={prices}
                />
              ))}
            </div>
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

interface Product {
  id: string;
  name: string;
  description: string | null;
  defaultPriceId: string | undefined;
  metadata: import('stripe').Stripe.Metadata;
  images: string[];
}

interface Price {
  id: string;
  productId: string;
  unitAmount: number | null;
  currency: string;
  interval: import('stripe').Stripe.Price.Recurring.Interval | undefined;
  trialPeriodDays: number | null | undefined;
}

function CourseCard({
  product,
  prices,
}: {
  product: Product;
  prices: Price[];
}) {
  return (
    <Card className="flex flex-col justify-between" key={product.id}>
      <CardHeader className="justify-center overflow-hidden items-center">
        <img
          src={product.images[0] || '/static/placeholder.png'}
          alt={product.name}
          className="rounded-md"
        />
      </CardHeader>
      <CardContent>
        <CardTitle>{product.name}</CardTitle>
        <CardDescription className="mt-2">
          {product.description}
        </CardDescription>
        <p className="font-bold mt-2">
          R${' '}
          {(
            (prices.find((price) => price.id === product.defaultPriceId)
              ?.unitAmount ?? 4000) / 100
          ).toFixed(2)}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <Button variant="outline" asChild className="w-full">
          <Link href={`/cursos/${product.id}/visao-geral`}>Saiba Mais</Link>
        </Button>
        <form className="w-full" action={checkoutAction}>
          <input type="hidden" name="priceId" value={product.defaultPriceId} />
          <SubmitButton />
        </form>
      </CardFooter>
    </Card>
  );
}
