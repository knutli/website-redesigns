import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { jersey, jerseyImage } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { publicImageUrl } from "@/lib/storage";

export default async function LockerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin?next=/locker");

  const items = await db
    .select({
      id: jersey.id,
      title: jersey.title,
      club: jersey.club,
      season: jersey.season,
      visibility: jersey.visibility,
      firstImage: jerseyImage.storageKey,
    })
    .from(jersey)
    .leftJoin(jerseyImage, and(eq(jerseyImage.jerseyId, jersey.id), eq(jerseyImage.order, 0)))
    .where(eq(jersey.ownerId, session.user.id))
    .orderBy(desc(jersey.createdAt));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Your locker</h1>
          <p className="text-sm text-muted-foreground">
            Public by default. Flip individual jerseys or the whole locker to private in{" "}
            <Link className="underline" href="/settings">
              Settings
            </Link>
            .
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">Upload jersey</Link>
        </Button>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
          Your locker is empty. Upload your first jersey — takes about 30 seconds.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square bg-muted">
                {item.firstImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={publicImageUrl(item.firstImage, { w: 600, h: 600, fit: "cover" })}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <CardContent className="p-3">
                <div className="text-sm font-medium line-clamp-1">{item.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {item.club} {item.season ? `· ${item.season}` : null}
                </div>
                {item.visibility === "private" ? (
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Private
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
