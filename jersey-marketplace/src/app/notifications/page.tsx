import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notification } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";

export default async function NotificationsPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/notifications");

  const rows = await db
    .select()
    .from(notification)
    .where(eq(notification.userId, s.user.id))
    .orderBy(desc(notification.createdAt))
    .limit(100);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl">Notifications</h1>
      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
          All caught up.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((n) => (
            <Card key={n.id}>
              <CardContent className="p-4 text-sm">
                <div className="text-xs uppercase text-muted-foreground">{n.kind}</div>
                <pre className="mt-1 whitespace-pre-wrap text-sm">
                  {JSON.stringify(n.payload, null, 2)}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
