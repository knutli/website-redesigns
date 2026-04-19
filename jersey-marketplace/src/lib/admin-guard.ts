import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Returns the admin user row if the session belongs to an admin, otherwise null.
 * Pass the session from Better Auth's `auth.api.getSession()`.
 */
export async function requireAdmin(session: { user: { id: string } } | null) {
  if (!session) return null;
  const [u] = await db.select().from(userTable).where(eq(userTable.id, session.user.id));
  return u?.role === "admin" ? u : null;
}
