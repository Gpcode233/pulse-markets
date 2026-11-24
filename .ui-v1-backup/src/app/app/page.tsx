"use client";
import * as React from "react";
import { TopNav } from "@/components/TopNav";
import { Hero } from "@/components/Hero";
import { ShieldsPanel } from "@/components/ShieldsPanel";
import { CoverageCalculator } from "@/components/CoverageCalculator";
import { mockShields, kpis } from "@/lib/mockData";
import type { ShieldStatus } from "@/lib/mockData";
import { useToast } from "@/components/ui/toast";
import { formatUsd } from "@/lib/utils";

export default function Page() {
  const [selectedId, setSelectedId] = React.useState<string>(mockShields[0].id);
  const [demoMode, setDemoMode] = React.useState<boolean>(true);
  const [statusOverrides, setStatusOverrides] = React.useState<Record<string, ShieldStatus>>({});
  const [triggeredCount, setTriggeredCount] = React.useState(0);
  const { push } = useToast();

  const selected = mockShields.find((s) => s.id === selectedId) ?? mockShields[0];
  const selectedStatus = statusOverrides[selected.id] ?? selected.status;

  function simulateShock() {
    setStatusOverrides((prev) => ({ ...prev, [selected.id]: "TRIGGERED" }));
    setTriggeredCount((c) => c + 1);
    push({
      variant: "warn",
      title: "Oracle shock detected",
      description: `${selected.asset} breached trigger. Shield flipped to TRIGGERED — claim is now live.`,
    });
  }

  function claim() {
    push({
      variant: "success",
      title: "Payout claimed",
      description: `USDC transferred from Pulse vault. Shield position closed.`,
    });
  }

  // KPIs react to the trigger count
  const liveKpis = {
    tvp: kpis.tvp + triggeredCount * 42_000,
    reserveRatio: kpis.reserveRatio,
    activeShields: Math.max(0, kpis.activeShields - triggeredCount),
  };

  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-[1200px] px-6 pb-24">
        <Hero
          tvp={liveKpis.tvp}
          reserveRatio={liveKpis.reserveRatio}
          activeShields={liveKpis.activeShields}
        />

        <section className="pt-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7">
              <ShieldsPanel
                shields={mockShields}
                statusOverrides={statusOverrides}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <CoverageCalculator
                shield={selected}
                status={selectedStatus}
                demoMode={demoMode}
                onToggleDemo={() => setDemoMode((d) => !d)}
                onSimulateShock={simulateShock}
                onClaim={claim}
              />
            </div>
          </div>
        </section>

        <footer className="mt-24 border-t border-silver-lining pt-6 flex items-center justify-between text-xs text-muted-ink">
          <span>
            Pulse Markets · Built for the Solana Perps &amp; Prediction Markets hackathon ·
            {" "}
            <span className="tabular font-mono text-seafoam-700">
              {formatUsd(liveKpis.tvp, 0)} protected
            </span>
          </span>
          <span>pm-AMM reference: predict-pm-amm.dev</span>
        </footer>
      </main>
    </>
  );
}
