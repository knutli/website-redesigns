import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { wanted, user as userTable, wantedImage } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNOK } from "@/lib/utils";
import { publicImageUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function WantedDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [row] = await db
    .select({
      id: wanted.id,
      title: wanted.title,
      club: wanted.club,
      country: wanted.country,
      season: wanted.season,
      sizePref: wanted.sizePref,
      player: wanted.player,
      description: wanted.description,
      maxPrice: wanted.maxPriceMinor,
      status: wanted.status,
      createdAt: wanted.createdAt,
      userId: wanted.userId,
      handle: userTable.handle,
      name: userTable.name,
    })
    .from(wanted)
    .innerJoin(userTable, eq(userTable.id, wanted.userId))
    .where(eq(wanted.id, id));

  if (!row) return notFound();

  const images = await db
    .select()
    .from(wantedImage)
    .where(eq(wantedImage.wantedId, id))
    .orderBy(asc(wantedImage.order));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-3">
        {images.map((img) => (
          <div key={img.id} className="overflow-hidden rounded-lg bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={publicImageUrl(img.storageKey, { w: 1200, h: 1200, fit: "contain" })}
              alt={row.title}
              className="w-full"
            />
          </div>
        ))}
        {images.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            No reference photos.
          </div>
        ) : null}
      </div>

      <aside className="space-y-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="text-xs uppercase text-muted-foreground">Wanted</div>
            <h1 className="font-display text-3xl leading-tight">{row.title}</h1>
            <div className="text-sm text-muted-foreground">
              Posted by{" "}
              <Link className="underline" href={`/u/${row.handle ?? ""}`}>
                {row.handle ? `@${row.handle}` : row.name}
              </Link>
            </div>
            {row.maxPrice ? (
              <div className="rounded-md bg-muted p-3">
                <div className="text-xs text-muted-foreground">Budget up to</div>
                <div className="font-display text-2xl">{formatNOK(row.maxPrice)}</div>
              </div>
            ) : null}

            <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
              {row.club && (
                <>
                  <dt className="text-muted-foreground">Club</dt>
                  <dd>{row.club}</dd>
                </>
              )}
              {row.season && (
                <>
                  <dt className="text-muted-foreground">Season</dt>
                  <dd>{row.season}</dd>
                </>
              )}
              {row.player && (
                <>
                  <dt className="text-muted-foreground">Player</dt>
                  <dd>{row.player}</dd>
                </>
              )}
              {row.sizePref && (
                <>
                  <dt className="text-muted-foreground">Size</dt>
                  <dd>{row.sizePref}</dd>
                </>
              )}
            </dl>
            {row.description ? (
              <div className="rounded-md border p-3 text-sm">{row.description}</div>
            ) : null}
            <Button className="w-full" asChild>
              <Link href={`/messages/new?to=${row.userId}&wanted=${row.id}`}>
                Message the poster
              </Link>
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
