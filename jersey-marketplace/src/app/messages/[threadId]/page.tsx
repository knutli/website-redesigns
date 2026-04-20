import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { message, messageThread, threadParticipant, user as userTable } from "@/lib/db/schema";
import { and, asc, eq, ne } from "drizzle-orm";
import { MessageInput } from "./message-input";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin?next=/messages");

  const { threadId } = await params;
  const [participant] = await db
    .select()
    .from(threadParticipant)
    .where(
      and(eq(threadParticipant.threadId, threadId), eq(threadParticipant.userId, session.user.id)),
    );
  if (!participant) return notFound();

  const [otherUser] = await db
    .select({ handle: userTable.handle, name: userTable.name })
    .from(threadParticipant)
    .innerJoin(userTable, eq(userTable.id, threadParticipant.userId))
    .where(
      and(eq(threadParticipant.threadId, threadId), ne(threadParticipant.userId, session.user.id)),
    )
    .limit(1);

  const messages = await db
    .select({
      id: message.id,
      body: message.body,
      senderId: message.senderId,
      createdAt: message.createdAt,
    })
    .from(message)
    .where(eq(message.threadId, threadId))
    .orderBy(asc(message.createdAt));

  const otherName = otherUser?.handle ? `@${otherUser.handle}` : otherUser?.name ?? "User";

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <h1 className="text-sm font-semibold text-foreground">{otherName}</h1>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderId === session.user.id;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  mine
                    ? "bg-green-400 text-white"
                    : "bg-card text-foreground border border-border"
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput threadId={threadId} />
    </div>
  );
}
