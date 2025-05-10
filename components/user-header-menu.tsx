import { signOut } from "@/app/(login)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import Link from "next/link";

export default function UserHeaderMenu({
  email,
  hasPassword,
}: {
  email: string;
  hasPassword: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="bg-transparent rounded-[100%] flex items-center justify-center">
          <User className="w-[21px] h-[21px]" color="black" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {email && (
          <DropdownMenuItem disabled className="cursor-default">
            <span className="text-sm text-gray-700">{email}</span>
          </DropdownMenuItem>
        )}
        {!hasPassword && (
          <DropdownMenuItem>
            <Link href="/criar-senha">Criar uma senha</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-red-500">
          <form action={signOut}>
            <button type="submit">Sair da Conta</button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
