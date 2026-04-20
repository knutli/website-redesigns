"use client";

import { useState } from "react";
import { Bell, MessageSquare, Search } from "lucide-react";
import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { HamburgerIcon } from "@/components/hamburger-icon";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function TopBarIcons() {
  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="ghost" size="icon" aria-label="Search">
        <Link href="/browse">
          <Search className="h-[22px] w-[22px]" />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon" aria-label="Notifications">
        <Link href="/notifications">
          <Bell className="h-[22px] w-[22px]" />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon" aria-label="Messages">
        <Link href="/messages">
          <MessageSquare className="h-[22px] w-[22px]" />
        </Link>
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-bg-raised md:block">
        <SidebarNav variant="desktop" />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background px-5 pb-3 pt-2 md:hidden">
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button type="button" aria-label="Open menu" className="p-1">
                <HamburgerIcon />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-full p-0">
              <SidebarNav variant="mobile" onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-display text-xl text-foreground">
            Oase
          </Link>
        </div>
        <TopBarIcons />
      </header>

      <main className="md:ml-60">
        {/* Desktop top bar */}
        <div className="hidden items-center justify-end gap-2 border-b border-border px-6 py-2 md:flex">
          <TopBarIcons />
          <ThemeToggle />
        </div>
        <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
