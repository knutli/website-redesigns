import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { messageThread, threadParticipant, message, user as userTable } from "@/lib/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/messages");

  const threads = await db
    .select({
      threadId: threadParticipant.threadId,
      kind: messageThread.kind,
      lastReadAt: threadParticipant.lastReadAt,
      createdAt: messageThread.createdAt,
    })
    .from(threadParticipant)
    .innerJoin(messageThread, eq(messageThread.id, threadParticipant.threadId))
    .where(eq(threadParticipant.userId, s.user.id))
    .orderBy(desc(messageThread.createdAt));

  const threadData = await Promise.all(
    threads.map(async (t) => {
      const [otherUser] = await db
        .select({ handle: userTable.handle, name: userTable.name })
        .from(threadParticipant)
        .innerJoin(userTable, eq(userTable.id, threadParticipant.userId))
        .where(
          and(eq(threadParticipant.threadId, t.threadId), ne(threadParticipant.userId, s.user.id)),
        )
        .limit(1);

      const [lastMsg] = await db
        .select({ body: message.body, createdAt: message.createdAt })
        .from(message)
        .where(eq(message.threadId, t.threadId))
        .orderBy(desc(message.createdAt))
        .limit(1);

      return { ...t, otherUser, lastMsg };
    }),
  );

  return (
    <div className="space-y-4">
      <h1 className="font-display text-lg">Messages</h1>
      {threadData.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-text-tertiary">
          No conversations yet. Messages from buyers, sellers, and listing questions show up here.
        </div>
      ) : (
        <div className="space-y-2">
          {threadData.map((t) => (
            <Link key={t.threadId} href={`/messages/${t.threadId}`}>
              <Card className="transition-colors hover:bg-card-hover">
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-raised text-sm font-semibold">
                    {(t.otherUser?.handle ?? t.otherUser?.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        {t.otherUser?.handle ? `@${t.otherUser.handle}` : t.otherUser?.name ?? "User"}
                      </span>
                      {t.kind === "qa" ? (
                        <span className="text-[10px] uppercase tracking-badge text-green-400">Q&A</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-text-tertiary line-clamp-1">
                      {t.lastMsg?.body ?? "No messages yet"}
                    </p>
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
