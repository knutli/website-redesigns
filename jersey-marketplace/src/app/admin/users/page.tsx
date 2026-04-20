import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await db
    .select({
      id: userTable.id,
      handle: userTable.handle,
      name: userTable.name,
      email: userTable.email,
      role: userTable.role,
      status: userTable.status,
      verifiedCollector: userTable.verifiedCollector,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .orderBy(desc(userTable.createdAt))
    .limit(100);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg">Users ({users.length})</h2>
      <div className="space-y-2">
        {users.map((u) => (
          <Card key={u.id}>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {u.handle ? `@${u.handle}` : u.name ?? u.email}
                </div>
                <div className="text-xs text-text-tertiary">
                  {u.email} · {u.role} · {u.status}
                  {u.verifiedCollector ? " · ✓ Verified" : ""}
                </div>
              </div>
              <div className="text-xs text-text-tertiary">
                {u.createdAt.toLocaleDateString("nb-NO")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
