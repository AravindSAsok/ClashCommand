"use client";

import Link from "next/link";
import {
  LayoutDashboard as Dashboard,
  Users,
  ShieldAlert,
  Flag,
  Activity,
  BarChart3,
  Settings,
  LogOut,
  ArrowRight,
} from "lucide-react";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/(app)/", icon: Dashboard },
  { name: "Clans", href: "/(app)/clans", icon: ShieldAlert },
  { name: "Members", href: "/(app)/members", icon: Users },
  { name: "Wars", href: "/(app)/wars", icon: Flag },
  { name: "Analytics", href: "/(app)/analytics", icon: BarChart3 },
  { name: "Settings", href: "/(app)/settings", icon: Settings },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-secondary/50 flex-shrink-0 hidden md:flex flex-col">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">Clash Command</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
              `}
            >
              <Icon className={isActive ? "w-5 h-5" : "w-5 h-5 text-muted-foreground"} />
              {item.name}
              {isActive && (
                <ArrowRight className="ml-auto w-4 h-4 text-primary-foreground" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign out</span>
        </Link>
      </div>
    </aside>
  );
}