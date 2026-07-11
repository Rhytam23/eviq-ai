import type { Metadata } from "next";
import "./globals.css";
import OpeningCinematic from "@/components/landing/OpeningCinematic";
import CustomCursor from "@/components/landing/CustomCursor";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EVIQ AI — AI Charging Intelligence for Every EV Journey",
  description:
    "EVIQ AI is the world's AI Operating System for EV Mobility Intelligence, predicting optimal charging decisions, charger reliability, queue times, and battery health.",
  metadataBase: new URL("https://eviq.ai"),
  openGraph: {
    title: "EVIQ AI — The operating system for EV mobility intelligence",
    description:
      "AI-powered EV charging decisions. Predict charger queues, reliability, and battery range in real time.",
    type: "website",
    siteName: "EVIQ AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "EVIQ AI — AI Charging Intelligence",
    description: "The operating system for EV mobility intelligence.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans bg-[#fcfcfd] text-ink-900 overflow-x-hidden`}>
        <OpeningCinematic />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
