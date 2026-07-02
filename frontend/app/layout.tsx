import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lumenpact — Commit. Stake. Deliver.",
  description:
    "Lock XLM with a personal goal. Nominate a Judge. Hit your target and get it back — or lose it. Built on Stellar Soroban smart contracts.",
  keywords: ["Stellar", "XLM", "accountability", "smart contracts", "Soroban"],
  openGraph: {
    title: "Lumenpact — Commit. Stake. Deliver.",
    description:
      "Your word, on-chain. Lock XLM, nominate a judge, and deliver on your commitment.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
