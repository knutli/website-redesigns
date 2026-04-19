import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { listing, jersey, auditLog, user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { inngest } from "@/lib/inngest";
import { sendListingApprovedEmail } from "@/lib/email";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const admin = await requireAdmin(session);
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await params;
  const [l] = await db.select().from(listing).where(eq(listing.id, id));
  if (!l || l.status !== "pending_review") {
    return NextResponse.json({ error: "Not pending" }, { status: 400 });
  }

  await db
    .update(listing)
    .set({
      status: "live",
      approvedBy: admin.id,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(listing.id, id));

  await db.update(jersey).set({ status: "live" }).where(eq(jersey.id, l.jerseyId));

  await db.insert(auditLog).values({
    actorId: admin.id,
    action: "listing.approve",
    targetType: "listing",
    targetId: id,
  });

  // Schedule auction end (if auction)
  if (l.type === "auction" && l.endAt) {
    await inngest.send({
      name: "auction/ended",
      data: { listingId: id },
      ts: l.endAt.getTime(),
    });
  }

  // Email the seller
  const [seller] = await db.select().from(userTable).where(eq(userTable.id, l.sellerId));
  const [j] = await db.select().from(jersey).where(eq(jersey.id, l.jerseyId));
  if (seller?.email) {
    await sendListingApprovedEmail({ to: seller.email, title: j.title });
  }

  return NextResponse.json({ ok: true });
}
