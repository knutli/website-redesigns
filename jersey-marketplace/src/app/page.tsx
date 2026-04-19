import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FeedPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-4xl">Velkommen til Oase</h1>
        <p className="text-muted-foreground">
          En oase for drakt­samlere. Kjøp, selg og by live. Build your locker.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-2xl">Sign up as a collector</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Email & password, verify, start your locker. Bidding unlocks once your email is verified.
            </p>
            <Button asChild className="mt-4">
              <Link href="/signin?mode=signup">Create account</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h2 className="font-display text-2xl">Sell on Oase</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in with Vipps to verify your identity, then list in minutes. 8% commission — seller keeps 92%.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/signin?mode=vipps">Sign in with Vipps</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Live now</h2>
        <p className="text-sm text-muted-foreground">
          The activity feed lights up once auctions start. For now, peek at the{" "}
          <Link className="underline" href="/browse">
            browse
          </Link>{" "}
          view.
        </p>
      </section>
    </div>
  );
}
