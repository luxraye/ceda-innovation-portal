import type { Metadata, Viewport } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

// Poppins is the typeface on ceda.co.bw.
const sans = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "CEDA Innovation Portal", template: "%s · CEDA Innovation Portal" },
  description:
    "The CEDA Innovation Portal: one place for Botswana's youth-owned companies to submit ideas, and for CEDA to evaluate, track and award them.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#120e0c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
