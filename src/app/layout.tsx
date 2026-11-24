import type { Metadata } from "next";
import { Familjen_Grotesk, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/providers/WalletProvider";
import { ToastRoot } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

const display = Familjen_Grotesk({ subsets: ["latin"], variable: "--font-familjen", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Pulse: short-term cover for your crypto",
  description: "Pick a risk, see your price, and get paid if it happens. Cover that lasts two to three days.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
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
