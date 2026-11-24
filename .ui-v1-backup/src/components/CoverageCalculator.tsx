"use client";
import * as React from "react";
import { CardFloating } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { premiumForCoverage } from "@/lib/pmAmm";
import { useCountdown } from "@/hooks/useCountdown";
import type { Shield, ShieldStatus } from "@/lib/mockData";
import { cn, formatUsd, shortTx } from "@/lib/utils";
import {
  IconBolt,
  IconRocket,
  IconBoltOff,
  IconShieldCheck,
} from "@tabler/icons-react";

interface Props {
  shield: Shield;
  status: ShieldStatus;
  demoMode: boolean;
  onToggleDemo: () => void;
  onSimulateShock: () => void;
  onClaim: () => void;
}

function mockHash() {
  const alpha = "123456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < 64; i++) out += alpha[Math.floor(Math.random() * alpha.length)];
  return out;
}

export function CoverageCalculator({
  shield,
  status,
  demoMode,
  onToggleDemo,
  onSimulateShock,
  onClaim,
}: Props) {
  const [portfolio, setPortfolio] = React.useState<string>("10000");
  const [coveragePct, setCoveragePct] = React.useState<number>(20);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [lastTx, setLastTx] = React.useState<string>("");
  const { push } = useToast();
  const { label, tau } = useCountdown(shield.expiryTs);

  const portfolioNum = Math.max(500, Math.min(50_000, Number(portfolio) || 0));
  const quote = premiumForCoverage(
    portfolioNum,
    coveragePct / 100,
    shield.probability,
    tau,
    shield.liquidityUsd,
  );

  const triggered = status === "TRIGGERED";

  function activate() {
    const h = mockHash();
    setLastTx(h);
    setDialogOpen(true);
  }

  return (
    <div className="sticky top-[84px] flex flex-col gap-4">
      <CardFloating className="p-6 bg-white">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <span className="h-8 w-8 rounded-[8px] bg-indigo-navy text-white inline-flex items-center justify-center">
              <IconShieldCheck size={16} />
            </span>
            <div>
              <div className="text-[11px] uppercase tracking-[0.08em] text-muted-ink">
                Coverage calculator
              </div>
              <div className="text-sm text-indigo-ink font-medium">{shield.title}</div>
            </div>
          </div>
          <button
            onClick={onToggleDemo}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 h-6 text-[11px] font-medium transition-colors",
              demoMode
                ? "bg-seafoam-50 border-seafoam-500/40 text-seafoam-700"
                : "bg-canvas border-silver-lining text-muted-ink",
            )}
            title="Toggle Demo Mode — works without a wallet"
          >
            {demoMode ? <IconBolt size={12} /> : <IconBoltOff size={12} />}
            Demo {demoMode ? "ON" : "OFF"}
          </button>
        </div>

        <Separator className="my-5" />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="portfolio">Portfolio value</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-ink">$</span>
              <Input
                id="portfolio"
                type="number"
                min={500}
                max={50000}
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="pl-7 tabular font-mono"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-ink">
              <span>min $500</span>
              <span>max $50,000</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <Label>Coverage %</Label>
              <span className="tabular font-mono text-seafoam-700 text-sm">
                {coveragePct}%
              </span>
            </div>
            <Slider
              min={5}
              max={50}
              step={1}
              value={[coveragePct]}
              onValueChange={(v) => setCoveragePct(v[0] ?? 20)}
            />
            <div className="flex items-center justify-between text-[11px] text-muted-ink">
              <span>5%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="grid grid-cols-2 gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">
              Guaranteed payout
            </div>
            <div className="mt-1 tabular font-mono text-[28px] text-seafoam-700 leading-none">
              {formatUsd(quote.coverageUsd, 0)}
            </div>
            <div className="text-[11px] text-muted-ink mt-1">if trigger fires</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Premium today</div>
            <div className="mt-1 tabular font-mono text-[28px] text-indigo-navy leading-none">
              {formatUsd(quote.premium, 2)}
            </div>
            <div className="text-[11px] text-muted-ink mt-1">
              {(quote.premiumPct * 100).toFixed(2)}% of coverage · YES @ ${quote.yesPrice.toFixed(3)}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-muted-ink">
          <span>Resolves in</span>
          <span className="tabular font-mono text-indigo-ink">{label}</span>
        </div>

        {/* THE one orange surface on the page */}
        <Button
          variant="orange"
          size="lg"
          className="mt-5 w-full h-12 text-[15px]"
          onClick={activate}
          disabled={triggered}
        >
          <IconRocket size={16} />
          Activate Shield
        </Button>

        <Button
          variant="secondary"
          size="md"
          className="mt-2 w-full"
          onClick={onSimulateShock}
          disabled={triggered}
        >
          <IconBolt size={14} />
          Simulate Oracle Shock &amp; Claim Payout
        </Button>

        {triggered && (
          <div className="mt-3 rounded-[8px] border border-danger/30 bg-red-50 p-3 flex items-start gap-3">
            <Badge variant="danger">Triggered</Badge>
            <div className="flex-1">
              <div className="text-sm text-indigo-ink font-medium">Parametric trigger fired.</div>
              <div className="text-xs text-muted-ink mt-0.5">
                YES shares are now redeemable 1:1 for USDC.
              </div>
            </div>
            <Button variant="danger" size="sm" onClick={onClaim}>
              Claim {formatUsd(quote.coverageUsd, 0)}
            </Button>
          </div>
        )}
      </CardFloating>

      <div className="rounded-[8px] border border-silver-lining bg-white p-4">
        <div className="text-[11px] uppercase tracking-[0.08em] text-muted-ink">
          Why Pulse
        </div>
        <ul className="mt-2 flex flex-col gap-2 text-xs text-indigo-ink leading-relaxed">
          <li>• pm-AMM Gaussian liquidity minimises LVR into resolution</li>
          <li>• Every YES+NO pair backed 1:1 by USDC in the vault</li>
          <li>• Pyth parametric resolution — no claims adjusters</li>
        </ul>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconShieldCheck size={18} className="text-seafoam-700" />
              Shield activated
            </DialogTitle>
            <DialogDescription>
              Your coverage is live on Solana devnet (mock tx in demo mode).
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-5 rounded-[8px] bg-canvas p-4 border border-silver-lining">
            <div>
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Shield</div>
              <div className="text-sm text-indigo-ink mt-1">{shield.title}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Resolves</div>
              <div className="tabular font-mono text-sm text-indigo-ink mt-1">{label}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Coverage</div>
              <div className="tabular font-mono text-sm text-seafoam-700 mt-1">
                {formatUsd(quote.coverageUsd, 0)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Premium paid</div>
              <div className="tabular font-mono text-sm text-indigo-navy mt-1">
                {formatUsd(quote.premium, 2)}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Tx hash</div>
              <div className="tabular font-mono text-xs text-indigo-ink mt-1 break-all">
                {shortTx(lastTx)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setDialogOpen(false);
                push({
                  variant: "success",
                  title: "Shield position opened",
                  description: `${formatUsd(quote.sharesNeeded, 0)} YES shares · expires ${label}`,
                });
              }}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
