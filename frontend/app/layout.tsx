import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupplyPilot — AI Operations Platform",
  description: "Connected intelligence and autonomous workflow execution for pharmaceutical supply chains.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
