import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { message, threadParticipant } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { pusher } from "@/lib/pusher";

const msgSchema = z.object({ body: z.string().min(1).max(5000) });

export async function POST(req: Request, { params }: { params: Promise<{ threadId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { threadId } = await params;
  const parsed = msgSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const [participant] = await db
    .select()
    .from(threadParticipant)
    .where(
      and(eq(threadParticipant.threadId, threadId), eq(threadParticipant.userId, session.user.id)),
    );
  if (!participant) return NextResponse.json({ error: "Not in this thread" }, { status: 403 });

  const [msg] = await db
    .insert(message)
    .values({
      threadId,
      senderId: session.user.id,
      body: parsed.data.body,
    })
    .returning();

  if (pusher) {
    await pusher.trigger(`private-dm-${threadId}`, "message.new", {
      id: msg.id,
      senderId: session.user.id,
      body: msg.body,
      createdAt: msg.createdAt.toISOString(),
    });
  }

  return NextResponse.json({ id: msg.id });
}
