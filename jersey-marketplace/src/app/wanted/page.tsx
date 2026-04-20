import Link from "next/link";
import { db } from "@/lib/db";
import { wanted, user as userTable } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNOK } from "@/lib/utils";
import { Plus } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-lg">Wanted</h1>
        {rows.length > 0 ? (
          <Button asChild size="sm">
            <Link href="/wanted/new">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Post
            </Link>
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <Link href="/wanted/new" className="block">
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-green-400/50 hover:bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900">
              <Plus className="h-6 w-6 text-green-300" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Post what you're looking for</p>
              <p className="mt-1 text-sm text-text-tertiary">
                Tell the community which jersey you want. Sellers with a match get notified.
              </p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <Link key={r.id} href={`/wanted/${r.id}`}>
              <Card className="transition-colors hover:bg-card-hover">
                <CardContent className="p-4">
                  <div className="font-medium text-foreground">{r.title}</div>
                  <div className="text-xs text-text-tertiary">
                    {[r.club, r.season, r.sizePref].filter(Boolean).join(" · ")}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-text-secondary">
                      {r.handle ? `@${r.handle}` : r.name}
                    </span>
                    {r.maxPrice ? (
                      <span className="font-semibold tabular-nums text-foreground">
                        up to {formatNOK(r.maxPrice)}
                      </span>
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
