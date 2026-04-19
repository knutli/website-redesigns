import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listing, jersey, auditLog, user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendListingRejectedEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const admin = await requireAdmin(session);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const { reason } = (await req.json()) as { reason?: string };
  if (!reason) return NextResponse.json({ error: "Reason required" }, { status: 400 });

  const [l] = await db.select().from(listing).where(eq(listing.id, id));
  if (!l || l.status !== "pending_review") {
    return NextResponse.json({ error: "Not pending" }, { status: 400 });
  }

  await db
    .update(listing)
    .set({
      status: "rejected",
      rejectedAt: new Date(),
      rejectedBy: admin.id,
      rejectedReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(listing.id, id));

  await db.update(jersey).set({ status: "draft" }).where(eq(jersey.id, l.jerseyId));

  await db.insert(auditLog).values({
    actorId: admin.id,
    action: "listing.reject",
    targetType: "listing",
    targetId: id,
    after: { reason },
  });

  const [seller] = await db.select().from(userTable).where(eq(userTable.id, l.sellerId));
  const [j] = await db.select().from(jersey).where(eq(jersey.id, l.jerseyId));
  if (seller?.email) {
    await sendListingRejectedEmail({ to: seller.email, title: j.title, reason });
  }

  return NextResponse.json({ ok: true });
}
