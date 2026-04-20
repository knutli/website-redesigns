import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FeedPage() {
  return (
    <div className="space-y-6">
      {/* Empty state */}
      <div className="mx-3.5 space-y-6 py-8 text-center">
        <div className="mx-auto max-w-sm space-y-3">
          <h2 className="font-display text-2xl text-foreground">
            Welcome to the collection
          </h2>
          <p className="text-sm text-text-secondary">
            The feed lights up once collectors start listing. Auctions, new locker adds, and
            community moments all show up here. For now, check the browse view or post what
            you're looking for.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button asChild>
            <Link href="/browse">Browse listings</Link>
          </Button>
          <Button asChild variant="soft">
            <Link href="/wanted/new">Post a Wanted</Link>
          </Button>
        </div>

        <div className="mx-auto max-w-sm space-y-2">
          <div className="flex justify-center gap-4">
            <Link href="/signin?mode=signup" className="text-sm font-medium text-green-400 hover:underline">
              Create account
            </Link>
            <span className="text-text-tertiary">·</span>
            <Link href="/signin?mode=vipps" className="text-sm font-medium text-green-400 hover:underline">
              Sell on Oase
            </Link>
          </div>
          <p className="text-xs text-text-tertiary">
            8% commission · seller keeps 92% · Vipps verified sellers
          </p>
        </div>
      </div>
    </div>
  );
}
