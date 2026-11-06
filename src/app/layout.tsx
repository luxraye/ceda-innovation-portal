import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";

const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-sora", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Sky · CEDA Innovation Portal", template: "%s · Sky" },
  description:
    "Sky is the CEDA Innovation Portal: one place for Botswana's youth-owned companies to submit ideas, and for CEDA to evaluate, track and award them.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
