import { siteName } from "@/lib/utils";
import Link from "next/link";
import { Button } from "./ui/button";
import UserHeaderMenu from "./user-header-menu";

export default function Header({
  userLoggedIn,
  email,
}: {
  userLoggedIn: boolean;
  email?: string;
}) {
  return (
    <header className="container mx-auto py-6">
      <nav className="flex justify-between items-center">
        <Link
          href="/"
          className="font-medium text-zinc-600 hover:text-zinc-900"
        >
          {siteName}
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/#cursos"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            Cursos
          </Link>
          {userLoggedIn ? (
            <>
              <Link
                href="/meus-cursos"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                Meus Cursos
              </Link>
              <UserHeaderMenu email={email} />
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              asChild
            >
              <Link href="/sign-in">Login</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
