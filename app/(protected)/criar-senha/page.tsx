"use client";

import { createPasswordAction } from "@/lib/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useActionState } from "react";
import { ActionState } from "@/lib/auth/middleware";
import { useState } from "react";
import { MainLayoutChildProps } from "../layout";
import { useRouter } from "next/navigation";

export default function CreatePasswordPage({ user }: MainLayoutChildProps) {
  const router = useRouter();
  if (user.passwordHash) {
    router.push("/");
  }

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createPasswordAction,
    { error: "", success: "" }
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordsMatch = password === confirmPassword;
  const buttonDisabled = pending || !passwordsMatch || password.length < 8;
  const showMismatchMessage =
    !passwordsMatch && password.length > 0 && confirmPassword.length > 0;

  return (
    <div className="flex-1 flex flex-col justify-center pb-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {state?.success ? "Senha criada com sucesso" : "Crie sua senha"}
        </h2>
      </div>

      {state?.success ? (
        <div className="text-center mt-6">
          <Button
            onClick={() => window.history.back()}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Voltar
          </Button>
        </div>
      ) : (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <form className="space-y-6" action={formAction}>
            <div>
              <Label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Nova Senha
              </Label>
              <div className="mt-1 flex items-center">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={100}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // Prevent focus shift
                  onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirme sua Senha
              </Label>
              <div className="mt-1 flex items-center">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={100}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // Prevent focus shift
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {showMismatchMessage && (
              <div className="text-red-500 text-sm">
                As senhas não coincidem.
              </div>
            )}

            {state?.error && (
              <div className="text-red-500 text-sm">{state.error}</div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                disabled={buttonDisabled}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Criando...
                  </>
                ) : (
                  "Criar Senha"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
