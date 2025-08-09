import { siteName } from "@/lib/utils";
import Link from "next/link";
import UserHeaderMenu from "./user-header-menu";
import { ProductColors } from "@/lib/fs/queries";

export default function Header({ colors }: { colors?: ProductColors }) {
  return (
    <div
      className={`${
        colors?.["bg-header"]
          ? colors["bg-header"]
          : "bg-zenite-background-light-neutral"
      } border-b shadow-sm`}
    >
      <header className="container mx-auto py-4 px-4 md:px-6">
        <nav
          className={`flex justify-between items-center ${
            colors?.["texto-header"]
              ? colors["texto-header"]
              : "text-zenite-primary-neutral"
          }`}
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
