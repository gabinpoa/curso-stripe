import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { customerPortalAction } from '@/lib/payments/actions';
import { TeamDataWithMembers, User } from '@/lib/db/schema';

export default function SubscriptionSettings({
  teamData,
}: {
  teamData: TeamDataWithMembers;
}) {
  const getUserDisplayName = (user: Pick<User, 'id' | 'name' | 'email'>) => {
    return user.name || user.email || 'Usuário Desconhecido';
  };

  // disabled teams functionality, only one user per team
  const thisUserData = teamData.teamMembers[0];

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
                <p className="font-medium">{teamData.planName || 'Gratuito'}</p>
                <p className="text-sm text-muted-foreground">
                  {teamData.subscriptionStatus === 'active'
                    ? 'Cobrado mensalmente'
                    : teamData.subscriptionStatus === 'trialing'
                    ? 'Período de teste'
                    : 'Sem assinatura ativa'}
                </p>
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
            <li
              key={thisUserData.id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {getUserDisplayName(thisUserData.user)
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {getUserDisplayName(thisUserData.user)}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {thisUserData.role}
                  </p>
                </div>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
