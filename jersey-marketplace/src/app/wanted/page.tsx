import Link from "next/link";
import { db } from "@/lib/db";
import { wanted, user as userTable } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNOK } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WantedBrowsePage() {
  const rows = await db
    .select({
      id: wanted.id,
      title: wanted.title,
      club: wanted.club,
      season: wanted.season,
      sizePref: wanted.sizePref,
      maxPrice: wanted.maxPriceMinor,
      handle: userTable.handle,
      name: userTable.name,
    })
    .from(wanted)
    .innerJoin(userTable, eq(userTable.id, wanted.userId))
    .where(eq(wanted.status, "active"))
    .orderBy(desc(wanted.createdAt))
    .limit(60);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Wanted</h1>
          <p className="text-sm text-muted-foreground">
            Reverse marketplace — collectors looking for specific jerseys. Have a match? Message the
            poster or list it.
          </p>
        </div>
        <Button asChild>
          <Link href="/wanted/new">Post a Wanted</Link>
        </Button>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          No active Wanted posts yet. Be the first — tell the community what you're hunting.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <Link key={r.id} href={`/wanted/${r.id}`}>
              <Card className="">
                <CardContent className="p-4">
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {[r.club, r.season, r.sizePref].filter(Boolean).join(" · ")}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {r.handle ? `@${r.handle}` : r.name}
                    </span>
                    {r.maxPrice ? (
                      <span className="font-semibold">up to {formatNOK(r.maxPrice)}</span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
