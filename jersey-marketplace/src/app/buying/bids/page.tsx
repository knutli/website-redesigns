import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function MyBidsPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/buying/bids");
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">My Bids</h1>
      <p className="text-muted-foreground">Active bids, outbid alerts, and won auctions will show here.</p>
    </div>
  );
}
