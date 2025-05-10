import { Suspense } from "react";
import { Login } from "../login";

export default function MagicLinkPage() {
  return (
    <Suspense>
      <Login mode="magiclink" />
    </Suspense>
  );
}
