import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clash Command",
  description: "Clash of Clans clan management and war tracking",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
