import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function ReadyToShipPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/selling/ready-to-ship");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Ready to ship</h1>
      <p className="text-muted-foreground">
        Paid orders awaiting shipment. Paste carrier + tracking number to mark as shipped.
      </p>
    </div>
  );
}
