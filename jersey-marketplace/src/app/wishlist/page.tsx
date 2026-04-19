import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function WishlistPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin?next=/wishlist");

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Wishlist</h1>
      <p className="text-sm text-muted-foreground">
        Saved auctions and buy-now listings. Alerts on outbid and ending-soon fire once you
        add items here.
      </p>
      <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
        Nothing saved yet.
      </div>
    </div>
  );
}
