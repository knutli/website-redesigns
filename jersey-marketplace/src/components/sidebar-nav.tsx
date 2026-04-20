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
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
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
  { href: "/selling", label: "Dashboard", icon: LayoutDashboard },
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
        "flex items-center gap-3 border-b border-border px-0 py-2.5 text-sm font-medium transition-colors duration-150",
        active
          ? "font-semibold text-foreground"
          : "text-text-secondary hover:text-foreground",
      )}
    >
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-green-400" : "text-text-tertiary")} />
      {label}
    </Link>
  );
}

function Section({ title, items, pathname }: { title?: string; items: Item[]; pathname: string }) {
  return (
    <div>
      {title ? (
        <div className="pb-0.5 pt-3 text-[10px] font-semibold uppercase tracking-section text-text-tertiary">
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
          <Plus className="mr-1 h-3.5 w-3.5" />
          Listing
        </Link>
      </Button>
      <Button asChild size="sm" variant="soft">
        <Link href="/wanted/new">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Wanted
        </Link>
      </Button>
    </div>
  );
}

function ThemeToggleInline() {
  const { theme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex items-center gap-3 border-b border-border px-0 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:text-foreground"
    >
      <Sun className="h-[18px] w-[18px] text-text-tertiary dark:hidden" />
      <Moon className="hidden h-[18px] w-[18px] text-text-tertiary dark:block" />
      <span className="dark:hidden">Dark mode</span>
      <span className="hidden dark:inline">Light mode</span>
    </button>
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
    <nav
      className="flex h-full flex-col overflow-y-auto px-5 py-4"
      onClick={onNavigate}
    >
      <Link href="/" className="mb-3 shrink-0">
        <span className="font-display text-2xl tracking-tight text-foreground">Oase</span>
      </Link>

      {variant === "mobile" ? (
        <div className="mb-2 shrink-0">
          <CreateCTAs />
        </div>
      ) : null}

      <div className="min-h-0 flex-1">
        <Section items={primary} pathname={pathname} />
        <Section title="Discover" items={discover} pathname={pathname} />
        <Section items={yours} pathname={pathname} />
        <Section title="Buying" items={buying} pathname={pathname} />
        <Section title="Selling" items={selling} pathname={pathname} />
      </div>

      <div className="shrink-0 space-y-2 pt-2">
        <Row href="/settings" label="Settings" icon={Settings} pathname={pathname} />
        <ThemeToggleInline />
        {variant === "desktop" ? <CreateCTAs /> : null}
      </div>
    </nav>
  );
}
