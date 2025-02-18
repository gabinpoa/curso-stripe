import { checkoutAction } from '@/lib/payments/actions';
import { Check } from 'lucide-react';
import { getStripePrices, getStripeProducts } from '@/lib/payments/stripe';
import { SubmitButton } from './submit-button';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Prices are fresh for four hours max
export const revalidate = 3600 * 4;

export default async function PricingPage() {
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-8 max-w-xl mx-auto">
        {prices.map((price) => {
          const product = products.find(
            (product) => product.id === price.productId
          );
          if (product) {
            return (
              <PricingCard
                key={price.id}
                name={product?.name || 'Desconhecido'}
                price={price.unitAmount!}
                interval={
                  (price.interval === 'month' ? 'mês' : price.interval) || 'mês'
                }
                trialDays={price.trialPeriodDays || 7}
                features={product.metadata.features?.split(',')}
                priceId={price.id}
                productId={product.id}
              />
            );
          }
          return null;
        })}
      </div>
    </main>
  );
}

function PricingCard({
  name,
  price,
  interval,
  trialDays,
  features,
  priceId,
  productId,
}: {
  name: string;
  price: number;
  interval: string;
  trialDays: number;
  features?: string[];
  priceId?: string;
  productId: string;
}) {
  return (
    <div className="p-3 border shadow rounded flex flex-col justify-between">
      <h2 className="text-2xl font-medium text-gray-900 mb-2">{name}</h2>
      <p className="text-sm text-gray-600 mb-4">
        teste grátis por {trialDays} dias
      </p>
      <p className="text-4xl font-medium text-gray-900 mb-6">
        R${price / 100}{' '}
        <span className="text-xl font-normal text-gray-600">
          por usuário / {interval}
        </span>
      </p>
      <ul className="space-y-4 mb-8">
        {features &&
          features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
      </ul>
      <Link href={`/cursos/${productId}/visao-geral`}>
        <Button className="w-full bg-white hover:bg-gray-100 text-black border border-gray-200 rounded-full flex items-center justify-center">
          Ver curso
        </Button>
      </Link>
      <form action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <SubmitButton />
      </form>
    </div>
  );
}
