import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { wanted } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function MyWantedPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/wanted/mine");

  const rows = await db
    .select()
    .from(wanted)
    .where(eq(wanted.userId, s.user.id))
    .orderBy(desc(wanted.createdAt));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">My Wanted</h1>
          <p className="text-sm text-muted-foreground">
            Your posts. Active ones get matching-listing alerts.
          </p>
        </div>
        <Button asChild>
          <Link href="/wanted/new">New Wanted</Link>
        </Button>
      </header>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          You haven't posted any Wanted items yet.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs uppercase text-muted-foreground">{r.status}</div>
                </div>
                <Button variant="ghost" asChild>
                  <Link href={`/wanted/${r.id}`}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
