import { db } from "@/lib/db";
import { listing } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const [[pending]] = [
    await db.select({ n: count() }).from(listing).where(eq(listing.status, "pending_review")),
  ];
  const [[live]] = [
    await db.select({ n: count() }).from(listing).where(eq(listing.status, "live")),
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Admin</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase text-muted-foreground">Pending review</div>
            <div className="mt-1 font-display text-3xl">{pending?.n ?? 0}</div>
            <Link href="/admin/approvals" className="mt-2 inline-block text-sm underline">
              Open approval queue
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase text-muted-foreground">Live listings</div>
            <div className="mt-1 font-display text-3xl">{live?.n ?? 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
