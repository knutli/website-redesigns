import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function MessagesPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/messages");

  return (
    <div className="space-y-4">
      <h1 className="font-display text-lg">Messages</h1>
      <p className="text-sm text-muted-foreground">
        Direct messages and Ask-a-question threads land here in M5.
      </p>
      <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
        No threads yet.
      </div>
    </div>
  );
}
