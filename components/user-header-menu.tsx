import { signOut } from "@/app/(login)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

export default function UserHeaderMenu({ email }: { email?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="bg-transparent rounded-[100%] flex items-center justify-center">
          <User className="w-[21px] h-[21px]" color="white" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48">
        {email && (
          <DropdownMenuItem>
            <span className="text-sm text-gray-700">{email}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="text-red-500">
          <form action={signOut}>
            <button type="submit">Sign Out</button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
