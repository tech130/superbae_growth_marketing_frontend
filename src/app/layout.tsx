import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Affiliate Management | Super Bae",
  description: "Affiliate onboarding, tracking, commission engine and payouts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex">
        <Sidebar />
        <main className="flex-1 min-w-0 px-8 py-7">{children}</main>
      </body>
    </html>
  );
}
