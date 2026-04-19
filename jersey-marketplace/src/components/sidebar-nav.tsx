"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Heart,
  Shirt,
  Gavel,
  CreditCard,
  Package,
  Settings,
  Plus,
  ShoppingBag,
  Truck,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Item = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

const primary: Item[] = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/browse", label: "Browse", icon: Search },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/locker", label: "Locker", icon: Shirt },
];

const buying: Item[] = [
  { href: "/buying/bids", label: "My Bids", icon: Gavel },
  { href: "/buying/to-pay", label: "To Pay", icon: CreditCard },
  { href: "/buying/paid", label: "Paid", icon: Package },
];

const selling: Item[] = [
  { href: "/selling", label: "Seller Dashboard", icon: LayoutDashboard },
  { href: "/selling/awaiting-payment", label: "Awaiting Payment", icon: ShoppingBag },
  { href: "/selling/ready-to-ship", label: "Ready to Ship", icon: Truck },
];

function Section({ title, items, pathname }: { title?: string; items: Item[]; pathname: string }) {
  return (
    <div className="space-y-1">
      {title ? (
        <div className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
      ) : null}
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex h-full flex-col gap-2 p-4" onClick={onNavigate}>
      <Link href="/" className="mb-4 px-2">
        <span className="font-display text-2xl tracking-tight">Oase</span>
      </Link>

      <Section items={primary} pathname={pathname} />
      <Section title="Buying" items={buying} pathname={pathname} />
      <Section title="Selling" items={selling} pathname={pathname} />

      <div className="mt-auto space-y-2">
        <Link href="/settings" className="block">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
              pathname.startsWith("/settings")
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </div>
        </Link>

        <Button asChild size="lg" className="w-full rounded-xl">
          <Link href="/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload Jersey
          </Link>
        </Button>
      </div>
    </nav>
  );
}
