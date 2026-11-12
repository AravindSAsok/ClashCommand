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
    <aside className="w-64 border-r border-border bg-secondary/50 flex-shrink-0 hidden md:flex flex-col">
      <div className="flex items-center gap-2 p-6">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-primary-foreground" suppressHydrationWarning />
        </div>
        <span className="font-bold text-lg tracking-tight">Clash Command</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}`}>
              <Icon className="h-5 w-5" suppressHydrationWarning />
              {item.name}
              {isActive && <ArrowRight className="ml-auto h-4 w-4" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-border">
        <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10">
          <LogOut className="h-5 w-5" /> Sign out
        </Link>
      </div>
    </aside>
  );
}
