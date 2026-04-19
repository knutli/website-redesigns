import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/signin?next=/settings");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="text-sm text-muted-foreground">Account, identity, privacy, payouts.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="handle">Handle</Label>
            <Input id="handle" name="handle" defaultValue={session.user.name ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" name="bio" />
          </div>
          <Button>Save</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your locker is public by default. Flip to private and no one else can see your
            collection. You can also flip individual jerseys from their detail page.
          </p>
          <Button variant="outline">Make locker private</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sell on Oase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            To list jerseys for sale you need to verify your identity with Vipps and complete
            Stripe onboarding (KYC + payout account).
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <a href="/api/auth/vipps/start">Verify with Vipps</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/stripe/connect/start">Set up payouts</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">NB / EN toggle lands with M6.</p>
        </CardContent>
      </Card>
    </div>
  );
}
