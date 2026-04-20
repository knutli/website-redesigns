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
import { Plus } from "lucide-react";

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
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-display text-lg">Your locker</h1>
        {items.length > 0 ? (
          <Button asChild size="sm">
            <Link href="/upload">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Upload
            </Link>
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <Link href="/upload" className="block">
          <div className="flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-green-400/50 hover:bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900">
              <Plus className="h-6 w-6 text-green-300" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Upload your first jersey</p>
              <p className="mt-1 text-sm text-text-tertiary">
                Takes about 30 seconds. Public by default — flip to private in Settings.
              </p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square bg-card-hover">
                {item.firstImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={publicImageUrl(item.firstImage, { w: 600, h: 600, fit: "cover" })}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <CardContent className="p-2.5">
                <div className="text-xs font-semibold text-foreground line-clamp-1">{item.title}</div>
                <div className="text-[10px] text-text-tertiary line-clamp-1">
                  {item.club} {item.season ? `· ${item.season}` : null}
                </div>
                {item.visibility === "private" ? (
                  <div className="mt-1 text-[10px] uppercase tracking-badge text-text-tertiary">
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
