import Link from "next/link";
import { db } from "@/lib/db";
import { collection, user as userTable } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DiscoverCollectionsPage() {
  const rows = await db
    .select({
      id: collection.id,
      name: collection.name,
      slug: collection.slug,
      coverImage: collection.coverImage,
      handle: userTable.handle,
    })
    .from(collection)
    .innerJoin(userTable, eq(userTable.id, collection.userId))
    .where(eq(collection.isPublic, true))
    .orderBy(desc(collection.createdAt))
    .limit(60);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Collections</h1>
        <p className="text-sm text-muted-foreground">
          Curated jersey sets by the community. Featured picks rotate weekly.
        </p>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          No public collections yet. Once users pin collections to their profile, they show up here.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
            <Link key={c.id} href={`/u/${c.handle ?? ""}/c/${c.slug}`}>
              <Card className="transition hover:shadow-md">
                <CardContent className="p-4">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.handle ? `@${c.handle}` : null}
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
