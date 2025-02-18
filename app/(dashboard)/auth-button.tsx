import { Button } from '@/components/ui/button';
import { getUser } from '@/lib/db/queries';
import Link from 'next/link';

type AuthButtonProps = {
  variant?:
    | 'link'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | null
    | undefined;
  className?: string | undefined;
};

export default async function AuthButton({
  variant,
  className,
}: AuthButtonProps) {
  const user = await getUser();
  return (
    <Button variant={variant} className={className} asChild>
      {user ? (
        <Link href="/dashboard">Dashboard</Link>
      ) : (
        <Link href="/sign-in">Entrar</Link>
      )}
    </Button>
  );
}
