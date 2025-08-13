import { siteName } from "@/lib/utils";
import Link from "next/link";
import UserHeaderMenu from "./user-header-menu";
import { ProductColors } from "@/lib/fs/queries";

export default function Header({ colors }: { colors?: ProductColors }) {
  return (
    <div
      className="border-b shadow-sm bg-zenite-background-light-neutral"
      style={{
        backgroundColor: colors?.["bg-header"] || undefined,
      }}
    >
      <header className="container mx-auto py-4 px-4 md:px-6">
        <nav
          className="flex justify-between items-center text-zenite-primary-neutral"
          style={{
            color: colors?.["texto-header"] || undefined,
          }}
        >
          <Link
            href="/"
            className="font-semibold text-sm sm:text-base hover:text-zinc-900"
          >
            {siteName}
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-zenite-primary-neutral hover:text-zinc-900 p6"
            >
              Meus Cursos
            </Link>
            <UserHeaderMenu />
          </div>
        </nav>
      </header>
    </div>
  );
}
