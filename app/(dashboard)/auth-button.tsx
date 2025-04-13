import { Button } from '@/components/ui/button';
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
  userLoggedIn?: boolean;
};

export default async function AuthButton({
  variant,
  className,
  userLoggedIn,
}: AuthButtonProps) {
  return (
    <Button variant={variant} className={className} asChild>
      {userLoggedIn ? (
        <Link href="/meus-cursos">Meus Cursos</Link>
      ) : (
        <Link href="/sign-in">Entrar</Link>
      )}
    </Button>
  );
}
