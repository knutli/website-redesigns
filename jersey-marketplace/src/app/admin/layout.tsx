import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin?next=/admin");
  const [u] = await db.select().from(userTable).where(eq(userTable.id, session.user.id));
  if (u?.role !== "admin") redirect("/");

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-4 border-b pb-3 text-sm">
        <Link href="/admin" className="font-medium hover:underline">
          Overview
        </Link>
        <Link href="/admin/approvals" className="font-medium hover:underline">
          Approvals
        </Link>
        <Link href="/admin/reports" className="font-medium hover:underline">
          Reports
        </Link>
        <Link href="/admin/users" className="font-medium hover:underline">
          Users
        </Link>
      </nav>
      {children}
    </div>
  );
}
