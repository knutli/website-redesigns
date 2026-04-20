import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { WantedForm } from "./wanted-form";

export default async function NewWantedPage() {
  const s = await auth.api.getSession({ headers: await headers() });
  if (!s) redirect("/signin?next=/wanted/new");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-lg">Post a Wanted</h1>
        <p className="text-sm text-text-secondary">
          Tell the community what you're hunting. Sellers with matching jerseys get notified, and
          you'll get a ping when a listing matches your post.
        </p>
      </header>
      <WantedForm />
    </div>
  );
}
