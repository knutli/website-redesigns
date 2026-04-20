import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignInForm } from "./sign-in-form";
import { isVippsConfigured } from "@/lib/auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; next?: string }>;
}) {
  const params = await searchParams;
  const mode = params.mode ?? "signin";
  const next = params.next ?? "/";

  return (
    <div className="mx-auto max-w-md space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="font-display text-lg">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Buyers and bidders sign in with email. Sellers use Vipps to verify identity.
        </p>
      </header>

      {isVippsConfigured() ? (
        <Card>
          <CardHeader>
            <CardTitle>Selling on Oase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Norwegian sellers sign in with Vipps. Other countries coming as we expand in the EU.
            </p>
            <Button asChild className="w-full">
              <Link href={`/api/auth/vipps/start?next=${encodeURIComponent(next)}`}>
                Continue with Vipps
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Vipps Login isn't configured yet — see OUTSTANDING_SETUP.md. Sellers will be able to
            verify identity here once Vipps keys are added.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{mode === "signup" ? "Sign up with email" : "Sign in with email"}</CardTitle>
        </CardHeader>
        <CardContent>
          <SignInForm mode={mode === "signup" ? "signup" : "signin"} next={next} />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link className="underline" href={`/signin?next=${encodeURIComponent(next)}`}>
              Sign in
            </Link>
          </>
        ) : (
          <>
            Don't have an account?{" "}
            <Link className="underline" href={`/signin?mode=signup&next=${encodeURIComponent(next)}`}>
              Create one
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
