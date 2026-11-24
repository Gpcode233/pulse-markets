"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { IconShieldCheck } from "@tabler/icons-react";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false },
);

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 h-[60px] w-full border-b border-silver-lining bg-white/70 backdrop-blur-xl">
      <div className="mx-auto h-full max-w-[1200px] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-[8px] bg-indigo-navy inline-flex items-center justify-center text-white">
            <IconShieldCheck size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[16px] font-semibold tracking-[-0.01em] text-indigo-ink">Pulse</span>
            <span className="text-[16px] font-medium text-muted-ink">Markets</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="seafoam" className="gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-seafoam-500 animate-pulse" />
            Oracle Healthy
          </Badge>
          <Badge variant="neutral">Devnet</Badge>
          <WalletMultiButton />
        </div>
      </div>
    </header>
  );
}
