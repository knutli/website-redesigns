import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function PaidPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/buying/paid");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Paid</h1>
      <p className="text-muted-foreground">
        Orders you've paid for, with shipment tracking and delivery confirmation.
      </p>
    </div>
  );
}
