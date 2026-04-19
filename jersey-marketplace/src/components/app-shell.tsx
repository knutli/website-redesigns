"use client";

import { useState } from "react";
import { Menu, Heart, Bell, MessageSquare } from "lucide-react";
import Link from "next/link";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

function TopBarIcons() {
  return (
    <div className="flex items-center gap-1">
      <Button asChild variant="ghost" size="icon" aria-label="Wishlist">
        <Link href="/wishlist">
          <Heart className="h-5 w-5" />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon" aria-label="Notifications">
        <Link href="/notifications">
          <Bell className="h-5 w-5" />
        </Link>
      </Button>
      <Button asChild variant="ghost" size="icon" aria-label="Messages">
        <Link href="/messages">
          <MessageSquare className="h-5 w-5" />
        </Link>
      </Button>
      <ThemeToggle />
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card md:block">
        <SidebarNav variant="desktop" />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-2 py-2 backdrop-blur md:hidden">
        <div className="flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarNav variant="mobile" onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-display text-xl">
            Oase
          </Link>
        </div>
        <TopBarIcons />
      </header>

      <main className="md:ml-64">
        {/* Desktop top bar */}
        <div className="hidden items-center justify-end gap-2 border-b px-6 py-2 md:flex">
          <TopBarIcons />
        </div>
        <div className="mx-auto max-w-6xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
