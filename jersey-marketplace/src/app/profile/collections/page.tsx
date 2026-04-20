import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { collection } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function MyCollectionsPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/profile/collections");

  const rows = await db
    .select()
    .from(collection)
    .where(eq(collection.userId, s.user.id))
    .orderBy(desc(collection.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="text-text-secondary hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl">My Collections</h1>
      </div>
      <p className="text-sm text-text-secondary">
        Curated sets of jerseys you can pin to your public profile.
      </p>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-text-tertiary">
          No collections yet. Group your jerseys by theme — era, league, colour, whatever you want.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4">
                <div className="font-semibold text-foreground">{c.name}</div>
                <div className="text-xs text-text-tertiary">{c.isPublic ? "Public" : "Private"}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
