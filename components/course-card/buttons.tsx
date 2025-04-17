import { checkoutAction } from "@/lib/payments/actions";
import { SubmitButton } from "../submit-button";
import { Button } from "../ui/button";
import Link from "next/link";

interface Props {
  productId: string;
  priceId: string;
  isSubscribed: boolean;
}

export default function CourseCardButtons({
  productId,
  priceId,
  isSubscribed,
}: Props) {
  if (isSubscribed) {
    return (
      <Button asChild className="w-full">
        <Link href={`/cursos/${productId}`}>Ver Conteúdo</Link>
      </Button>
    );
  }

  return (
    <>
      <Button variant="outline" asChild className="w-full">
        <Link href={`/cursos/${productId}/visao-geral`}>Saiba Mais</Link>
      </Button>
      <form className="w-full" action={checkoutAction}>
        <input type="hidden" name="priceId" value={priceId} />
        <input
          type="hidden"
          name="redirectUrl"
          value={`/cursos/${productId}/visao-geral`}
        />
        <SubmitButton />
      </form>
    </>
  );
}
