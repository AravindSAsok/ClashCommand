import type { Metadata } from "next";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { SideNav } from "@/components/layout/side-nav";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Clash Command",
  description: "Clash of Clans clan management & war analytics platform",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/(auth)/login");
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Toaster />
      <div className="flex-1 flex overflow-hidden">
        <SideNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}