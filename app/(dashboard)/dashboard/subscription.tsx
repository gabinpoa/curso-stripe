import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import Stripe from 'stripe';

interface Subscription {
  status: Stripe.Subscription.Status | null;
  productName: string;
}

interface Props {
  subscriptions: Subscription[];
  email: string;
}

function getSubscriptionStatusLabel(label: Stripe.Subscription.Status | null) {
  switch (label) {
    case 'active':
      return 'Ativa';
    case 'trialing':
      return 'Em teste';
    case 'canceled':
      return 'Cancelada';
    case 'incomplete':
      return 'Incompleta';
    case 'incomplete_expired':
      return 'Expirada';
    case 'past_due':
      return 'Atrasada';
    case 'paused':
      return 'Pausada';
    case 'unpaid':
      return 'Não paga';
    default:
      return 'Desconhecida';
  }
}

export default function SubscriptionSettings({ subscriptions, email }: Props) {
  return (
    <>
      <h1 className="text-lg lg:text-2xl font-medium mb-6">
        Configurações da Assinatura
      </h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Assinaturas ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                {subscriptions.map((subscription) => (
                  <div key={subscription.productName}>
                    <p className="font-medium">{subscription.productName}</p>
                    <p className="text-sm text-muted-foreground">
                      {getSubscriptionStatusLabel(subscription.status)}
                    </p>
                  </div>
                ))}
              </div>
              <form action={customerPortalAction}>
                <Button type="submit" variant="outline">
                  Gerenciar Assinatura
                </Button>
              </form>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            <li className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>{email[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{email}</p>
                </div>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
