"use client";

import Link from "next/link";
import { LayoutDashboard, Users, ShieldAlert, Flag, LogOut, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clans", href: "/clans", icon: ShieldAlert },
  { name: "Members", href: "/members", icon: Users },
  { name: "Wars", href: "/wars", icon: Flag },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-border bg-secondary/50 md:flex">
        <div className="flex items-center gap-2 p-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <ShieldAlert className="h-5 w-5 text-primary-foreground" suppressHydrationWarning />
          </div>
          <span className="text-lg font-bold tracking-tight">Clash Command</span>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6" aria-label="Main navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
                <Icon className="h-5 w-5" suppressHydrationWarning />
                {item.name}
                {isActive && <ArrowRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-6">
          <Link href="/api/auth/signout" className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10">
            <LogOut className="h-5 w-5" /> Sign out
          </Link>
        </div>
      </aside>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-border bg-background/95 px-2 pt-2 pb-[env(safe-area-inset-bottom)] shadow-lg backdrop-blur-md md:hidden"
      >
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-xs font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
