import { siteName } from "@/lib/utils";
import Link from "next/link";
import UserHeaderMenu from "./user-header-menu";

export default function Header() {
  return (
    <header className="container mx-auto py-6 px-4 md:px-6">
      <nav className="flex justify-between items-center">
        <Link
          href="/"
          className="font-medium text-zinc-600 hover:text-zinc-900"
        >
          {siteName}
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 p6"
          >
            Meus Cursos
          </Link>
          <UserHeaderMenu />
        </div>
      </nav>
    </header>
  );
}
