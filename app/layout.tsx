import { SITE_URL } from "@/lib/site";
import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import RegisterSw from "@/components/RegisterSw";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "EVIQ: know the charger works before you drive there", template: "%s | EVIQ" },
  description:
    "EVIQ is a driver-verified reliability layer for EV charging. Registries say a charger exists; EVIQ combines operator data with one-tap driver reports to show whether it works, anywhere in the world.",
  openGraph: {
    title: "EVIQ: know the charger works before you drive there",
    description:
      "Driver-verified charger status for any city, with the rules behind every label in the open.",
    type: "website",
    siteName: "EVIQ",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F6F5F0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${serif.variable}`}>
      <body className="font-sans">
        {children}
        <RegisterSw />
      </body>
    </html>
  );
}
