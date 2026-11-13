import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SideNav } from "@/components/layout/side-nav";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Clash Command",
  description: "Clash of Clans clan management and war tracking",
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Toaster />
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
