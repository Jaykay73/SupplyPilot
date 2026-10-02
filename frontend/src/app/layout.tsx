import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/context/QueryProvider";
import { GuideTourProvider } from "@/context/GuideTourContext";
import { TourSpotlight } from "@/components/shared/TourSpotlight";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SupplyPilot — Autonomous AI Operations Platform",
  description:
    "Industrial-grade operational intelligence, supply chain cascade disruption analysis, and human-in-the-loop decision automation for PharmaPulse Synthetics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-background text-text-primary min-h-screen antialiased selection:bg-accent-purple/20 selection:text-text-primary">
        <QueryProvider>
          <AuthProvider>
            <GuideTourProvider>
              {children}
              <TourSpotlight />
              <Toaster
                theme="light"
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    color: "#0F172A",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
                  },
                }}
              />
            </GuideTourProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
