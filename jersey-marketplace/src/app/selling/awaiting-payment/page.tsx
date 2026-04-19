import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AwaitingPaymentPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/selling/awaiting-payment");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Awaiting payment</h1>
      <p className="text-muted-foreground">
        Orders where the buyer has won or committed but hasn't paid yet.
      </p>
    </div>
  );
}
