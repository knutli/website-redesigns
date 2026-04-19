import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { user as userTable, jersey, jerseyImage } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { publicImageUrl } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const [u] = await db.select().from(userTable).where(eq(userTable.handle, handle)).limit(1);
  if (!u) return notFound();

  const items = u.lockerPublic
    ? await db
        .select({
          id: jersey.id,
          title: jersey.title,
          club: jersey.club,
          firstImage: jerseyImage.storageKey,
        })
        .from(jersey)
        .leftJoin(jerseyImage, and(eq(jerseyImage.jerseyId, jersey.id), eq(jerseyImage.order, 0)))
        .where(and(eq(jersey.ownerId, u.id), eq(jersey.visibility, "public")))
        .orderBy(desc(jersey.createdAt))
    : [];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl">@{u.handle}</h1>
        <p className="text-sm text-muted-foreground">
          {u.location ?? null}
          {u.favouriteClub ? ` · ${u.favouriteClub}` : null}
        </p>
        {u.bio ? <p>{u.bio}</p> : null}
      </header>

      <section className="space-y-2">
        <h2 className="font-medium">Locker</h2>
        {!u.lockerPublic ? (
          <p className="text-sm text-muted-foreground">This locker is private.</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Empty locker so far.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((j) => (
              <Card key={j.id} className="overflow-hidden">
                <div className="aspect-square bg-muted">
                  {j.firstImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={publicImageUrl(j.firstImage, { w: 500, h: 500, fit: "cover" })}
                      alt={j.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <CardContent className="p-3">
                  <div className="text-sm font-medium line-clamp-1">{j.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{j.club}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
