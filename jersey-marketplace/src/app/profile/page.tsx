import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable, jersey, jerseyImage, collection, wishlist, listing } from "@/lib/db/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { publicImageUrl } from "@/lib/storage";
import { Heart, Layers, Shirt, Settings, Bookmark } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin?next=/profile");

  const [u] = await db.select().from(userTable).where(eq(userTable.id, session.user.id));
  if (!u) redirect("/signin");

  const [{ jerseyCount }] = await db
    .select({ jerseyCount: count() })
    .from(jersey)
    .where(eq(jersey.ownerId, u.id));

  const [{ collectionCount }] = await db
    .select({ collectionCount: count() })
    .from(collection)
    .where(eq(collection.userId, u.id));

  const [{ wishlistCount }] = await db
    .select({ wishlistCount: count() })
    .from(wishlist)
    .where(eq(wishlist.userId, u.id));

  const recentJerseys = await db
    .select({
      id: jersey.id,
      title: jersey.title,
      club: jersey.club,
      firstImage: jerseyImage.storageKey,
    })
    .from(jersey)
    .leftJoin(jerseyImage, and(eq(jerseyImage.jerseyId, jersey.id), eq(jerseyImage.order, 0)))
    .where(eq(jersey.ownerId, u.id))
    .orderBy(desc(jersey.createdAt))
    .limit(4);

  return (
    <div className="space-y-6">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-border bg-bg-raised text-2xl">
          {u.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.image} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            (u.name ?? "?").charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl text-foreground">
            {u.handle ? `@${u.handle}` : u.name ?? "Your profile"}
          </h1>
          {u.bio ? <p className="mt-1 text-sm text-text-secondary line-clamp-2">{u.bio}</p> : null}
          <div className="mt-1.5 flex gap-4 text-xs text-text-tertiary">
            {u.location ? <span>{u.location}</span> : null}
            {u.favouriteClub ? <span>{u.favouriteClub}</span> : null}
          </div>
        </div>
        <Button asChild variant="ghost" size="icon" aria-label="Edit profile">
          <Link href="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="font-display text-xl tabular-nums text-foreground">{jerseyCount}</div>
            <div className="text-xs text-text-tertiary">In locker</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="font-display text-xl tabular-nums text-foreground">{collectionCount}</div>
            <div className="text-xs text-text-tertiary">Collections</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="font-display text-xl tabular-nums text-foreground">{wishlistCount}</div>
            <div className="text-xs text-text-tertiary">Wishlist</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/locker">
          <Card className="transition-colors hover:bg-card-hover">
            <CardContent className="flex items-center gap-3 p-3">
              <Shirt className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-sm font-semibold text-foreground">Locker</div>
                <div className="text-xs text-text-tertiary">Your jerseys</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/profile/collections">
          <Card className="transition-colors hover:bg-card-hover">
            <CardContent className="flex items-center gap-3 p-3">
              <Layers className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-sm font-semibold text-foreground">Collections</div>
                <div className="text-xs text-text-tertiary">Curated sets</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/profile/wishlist">
          <Card className="transition-colors hover:bg-card-hover">
            <CardContent className="flex items-center gap-3 p-3">
              <Heart className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-sm font-semibold text-foreground">Wishlist</div>
                <div className="text-xs text-text-tertiary">Saved listings</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/wanted/mine">
          <Card className="transition-colors hover:bg-card-hover">
            <CardContent className="flex items-center gap-3 p-3">
              <Bookmark className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-sm font-semibold text-foreground">Wanted</div>
                <div className="text-xs text-text-tertiary">Your ISO posts</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent locker items */}
      {recentJerseys.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between pb-3">
            <h2 className="font-display text-lg text-foreground">Recent in locker</h2>
            <Link href="/locker" className="text-xs font-medium text-green-400">See all</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {recentJerseys.map((j) => (
              <Card key={j.id} className="overflow-hidden">
                <div className="aspect-square bg-card-hover">
                  {j.firstImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={publicImageUrl(j.firstImage, { w: 400, h: 400, fit: "cover" })}
                      alt={j.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                </div>
                <CardContent className="p-2.5">
                  <div className="text-xs font-semibold text-foreground line-clamp-1">{j.title}</div>
                  <div className="text-[10px] text-text-tertiary line-clamp-1">{j.club}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
