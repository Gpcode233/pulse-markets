import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { ToastRoot } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pulse Markets · Parametric Shields on Solana",
  description:
    "48–72h parametric micro-insurance priced by a pm-AMM. Hedge SOL drawdowns, DeFi downtime, and gas spikes with 1:1 USDC-backed shields.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body>
        <WalletProvider>
          <TooltipProvider delayDuration={200}>
            <ToastRoot>{children}</ToastRoot>
          </TooltipProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
