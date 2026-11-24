"use client";
import * as React from "react";
function formatCompactUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

interface HeroProps {
  tvp: number;
  reserveRatio: number;
  activeShields: number;
}

function Kpi({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-ink">{label}</span>
      <span className="tabular font-mono text-[28px] font-medium leading-none text-seafoam-700">
        {value}
      </span>
      {hint && <span className="text-xs text-muted-ink">{hint}</span>}
    </div>
  );
}

export function Hero({ tvp, reserveRatio, activeShields }: HeroProps) {
  return (
    <section className="pt-14 pb-10">
      <div className="max-w-[820px]">
        <h1 className="text-[56px] leading-[1.05] font-medium tracking-[-0.025em] text-indigo-navy">
          Parametric risk protection,
          <br /> settled in seconds.
        </h1>
        <p className="mt-5 max-w-[560px] text-[15px] leading-relaxed text-muted-ink">
          Buy 48–72 hour shields against SOL drawdowns, DeFi downtime, and gas spikes.
          Priced live by a pm-AMM with Gaussian time-decay liquidity. Every payout is
          1:1 USDC-backed and resolved by Pyth.
        </p>
      </div>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-10 border-t border-silver-lining pt-6">
        <Kpi label="Total Value Protected" value={formatCompactUsd(tvp)} hint="Across all active shields" />
        <Kpi label="Reserve Ratio" value={`${(reserveRatio * 100).toFixed(1)}%`} hint="USDC backing YES+NO pairs" />
        <Kpi label="Active Shields" value={activeShields} hint="Devnet pm-AMM pools" />
      </div>
    </section>
  );
}
