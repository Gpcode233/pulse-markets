"use client";
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UnderwritePanel } from "@/components/UnderwritePanel";
import { DecayCurve } from "@/components/DecayCurve";
import { useCountdown } from "@/hooks/useCountdown";
import { priceYes, priceNo } from "@/lib/pmAmm";
import type { Shield, ShieldStatus } from "@/lib/mockData";
import { IconBolt, IconClockHour4, IconFlame } from "@tabler/icons-react";
import { cn, formatUsd } from "@/lib/utils";

interface Props {
  shields: Shield[];
  statusOverrides: Record<string, ShieldStatus>;
  selectedId: string;
  onSelect: (id: string) => void;
}

function ShieldCard({
  shield,
  status,
  selected,
  onClick,
}: {
  shield: Shield;
  status: ShieldStatus;
  selected: boolean;
  onClick: () => void;
}) {
  const { label, tau } = useCountdown(shield.expiryTs);
  const yes = priceYes(shield.probability, tau, shield.liquidityUsd);
  const no = priceNo(shield.probability, tau, shield.liquidityUsd);
  const totalSpan = shield.expiryTs - shield.startTs;
  const elapsed = 1 - Math.max(0, (shield.expiryTs - Date.now())) / totalSpan;

  const featured = shield.featured;
  const triggered = status === "TRIGGERED";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group text-left w-full rounded-[8px] border bg-white p-5 transition-all",
        "hover:-translate-y-[1px]",
        selected ? "border-indigo-navy ring-2 ring-indigo-navy/15" : "border-silver-lining",
        featured && "bg-gradient-to-br from-signal-orange-soft/70 to-white border-signal-orange/40",
      )}
      style={{ boxShadow: "var(--shadow-hairline)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "h-10 w-10 shrink-0 rounded-[8px] inline-flex items-center justify-center",
              featured ? "bg-signal-orange text-white" : "bg-indigo-navy/5 text-indigo-navy",
            )}
          >
            {featured ? <IconFlame size={18} /> : <IconBolt size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-medium text-indigo-ink tracking-[-0.005em]">
                {shield.title}
              </h3>
              {featured && <Badge variant="orange">Featured</Badge>}
              {triggered && <Badge variant="danger">Triggered</Badge>}
            </div>
            <p className="mt-1 text-xs text-muted-ink leading-relaxed max-w-[460px]">
              {shield.subtitle}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="inline-flex items-center gap-1.5 text-muted-ink">
            <IconClockHour4 size={14} />
            <span className="text-[11px] uppercase tracking-[0.08em]">Resolves in</span>
          </div>
          <span className="tabular font-mono text-[16px] text-indigo-navy">{label}</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-7 grid grid-cols-3 gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Underlying</div>
            <div className="text-sm text-indigo-ink mt-0.5">{shield.asset}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Trigger</div>
            <div className="text-sm text-indigo-ink mt-0.5">{shield.thresholdLabel}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Spot</div>
            <div className="tabular font-mono text-sm text-seafoam-700 mt-0.5">
              {shield.currentValue}
            </div>
          </div>
        </div>
        <div className="col-span-5">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">
                Liquidity decay (√τ)
              </div>
              <DecayCurve progress={elapsed} className="w-full h-9 mt-1" />
            </div>
            <div className="shrink-0 flex flex-col items-end">
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">YES</span>
                <span className="tabular font-mono text-sm text-seafoam-700">${yes.toFixed(3)}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">NO</span>
                <span className="tabular font-mono text-sm text-indigo-ink">${no.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export function ShieldsPanel({ shields, statusOverrides, selectedId, onSelect }: Props) {
  const totalTvl = shields.reduce((s, x) => s + x.tvlUsd, 0);

  return (
    <Tabs defaultValue="active">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[22px] font-medium tracking-[-0.015em] text-indigo-ink">
            Shields marketplace
          </h2>
          <p className="text-xs text-muted-ink mt-1">
            Live pm-AMM pools. Click a shield to price your coverage on the right.
          </p>
        </div>
        <TabsList>
          <TabsTrigger value="active">Active Shields</TabsTrigger>
          <TabsTrigger value="underwrite">Underwrite Pool</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="active" className="mt-0">
        <div className="flex flex-col gap-3">
          {shields.map((s) => (
            <ShieldCard
              key={s.id}
              shield={s}
              status={statusOverrides[s.id] ?? s.status}
              selected={selectedId === s.id}
              onClick={() => onSelect(s.id)}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-ink">
          <span>Pool TVL across shields</span>
          <span className="tabular font-mono text-seafoam-700">{formatUsd(totalTvl, 0)}</span>
          <Button variant="link" size="sm">View all markets →</Button>
        </div>
      </TabsContent>

      <TabsContent value="underwrite" className="mt-0">
        <Card className="p-6">
          <UnderwritePanel />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
