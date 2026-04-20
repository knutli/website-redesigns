"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Heart,
  Shirt,
  Gavel,
  Settings,
  Plus,
  Truck,
  LayoutDashboard,
  ShoppingBag,
  Target,
  Layers,
  Wallet,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const primary: Item[] = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/browse", label: "Browse", icon: Search },
];

const discover: Item[] = [
  { href: "/discover/collections", label: "Collections", icon: Layers },
  { href: "/wanted", label: "Wanted", icon: Target },
];

const yours: Item[] = [
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/locker", label: "Locker", icon: Shirt },
];

const buying: Item[] = [
  { href: "/buying/bids", label: "My Bids", icon: Gavel },
  { href: "/buying/to-pay", label: "To pay", icon: Receipt },
  { href: "/buying/ongoing", label: "Ongoing", icon: ShoppingBag },
  { href: "/buying/completed", label: "Completed", icon: Truck },
];

const selling: Item[] = [
  { href: "/selling", label: "Seller Dashboard", icon: LayoutDashboard },
  { href: "/selling/awaiting-payment", label: "Awaiting Payment", icon: ShoppingBag },
  { href: "/selling/ready-to-ship", label: "Ready to Ship", icon: Truck },
  { href: "/selling/wallet", label: "Wallet", icon: Wallet },
];

function Row({ href, label, icon: Icon, pathname }: Item & { pathname: string }) {
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3.5 border-b border-border px-0 py-[13px] text-base font-medium transition-colors duration-150",
        active
          ? "text-foreground font-semibold"
          : "text-text-secondary hover:text-foreground",
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", active ? "text-green-400" : "text-text-tertiary")} />
      {label}
    </Link>
  );
}

function Section({ title, items, pathname }: { title?: string; items: Item[]; pathname: string }) {
  return (
    <div>
      {title ? (
        <div className="pb-1 pt-4 text-xs font-semibold uppercase tracking-section text-text-tertiary">
          {title}
        </div>
      ) : null}
      {items.map((item) => (
        <Row key={item.href} {...item} pathname={pathname} />
      ))}
    </div>
  );
}

function CreateCTAs() {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button asChild size="sm">
        <Link href="/upload">
          <Plus className="mr-1.5 h-4 w-4" />
          Listing
        </Link>
      </Button>
      <Button asChild size="sm" variant="soft">
        <Link href="/wanted/new">
          <Plus className="mr-1.5 h-4 w-4" />
          Wanted
        </Link>
      </Button>
    </div>
  );
}

export function SidebarNav({
  onNavigate,
  variant = "desktop",
}: {
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  return (
    <nav className="flex h-full flex-col gap-1 px-5 py-6" onClick={onNavigate}>
      <Link href="/" className="mb-4">
        <span className="font-display text-2xl tracking-tight text-foreground">Oase</span>
      </Link>

      {variant === "mobile" ? (
        <div className="mb-3">
          <CreateCTAs />
        </div>
      ) : null}

      <Section items={primary} pathname={pathname} />
      <Section title="Discover" items={discover} pathname={pathname} />
      <Section items={yours} pathname={pathname} />
      <Section title="Buying" items={buying} pathname={pathname} />
      <Section title="Selling" items={selling} pathname={pathname} />

      <div className="mt-auto space-y-3">
        <Row href="/settings" label="Settings" icon={Settings} pathname={pathname} />
        {variant === "desktop" ? <CreateCTAs /> : null}
      </div>
    </nav>
  );
}
