import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { UploadWizard } from "./upload-wizard";

export default async function UploadPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin?next=/upload");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl">Upload a jersey</h1>
        <p className="text-sm text-muted-foreground">
          Add photos and details. Choose whether it stays in your locker, goes to auction, or lists
          as buy-now. Locker items skip review — sale listings go through admin first.
        </p>
      </header>
      <UploadWizard userId={session.user.id} />
    </div>
  );
}
