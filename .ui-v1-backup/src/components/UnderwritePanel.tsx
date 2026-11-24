"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import { projectedApy } from "@/lib/pmAmm";
import { formatUsd } from "@/lib/utils";
import { IconPigMoney, IconTrendingUp } from "@tabler/icons-react";

export function UnderwritePanel() {
  const [amount, setAmount] = React.useState<string>("5000");
  const { push } = useToast();

  const amt = Math.max(0, Number(amount) || 0);
  const poolUsdc = 1_610_000 + amt;
  const weeklyPremium = 18_400 + amt * 0.0025;
  const apy = projectedApy(poolUsdc, weeklyPremium);
  const shareOfPool = amt / poolUsdc;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-[18px] font-medium text-indigo-ink tracking-[-0.01em]">
            Underwrite the vault
          </h3>
          <p className="text-xs text-muted-ink mt-1 max-w-[460px]">
            Deposit USDC to back YES+NO pairs 1:1. You earn the premium flow from every
            shield buyer and absorb payouts if parametric triggers fire.
          </p>
        </div>
        <span className="h-10 w-10 rounded-[8px] bg-seafoam-50 text-seafoam-700 inline-flex items-center justify-center">
          <IconPigMoney size={18} />
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lp-amount">USDC deposit</Label>
        <div className="relative">
          <Input
            id="lp-amount"
            type="number"
            value={amount}
            min={0}
            onChange={(e) => setAmount(e.target.value)}
            className="pr-16 tabular font-mono"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-ink">
            USDC
          </span>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-3 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Projected APY</div>
          <div className="mt-1 tabular font-mono text-[22px] text-seafoam-700 inline-flex items-center gap-1">
            <IconTrendingUp size={16} />
            {(apy * 100).toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Pool size (after)</div>
          <div className="mt-1 tabular font-mono text-[22px] text-indigo-ink">
            {formatUsd(poolUsdc, 0)}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-muted-ink">Your share</div>
          <div className="mt-1 tabular font-mono text-[22px] text-indigo-ink">
            {(shareOfPool * 100).toFixed(2)}%
          </div>
          <Progress value={Math.min(100, shareOfPool * 100 * 10)} className="mt-2" />
        </div>
      </div>

      <Button
        size="lg"
        onClick={() =>
          push({
            variant: "success",
            title: "Underwrite submitted (devnet mock)",
            description: `Deposited ${formatUsd(amt, 0)} USDC into Pulse vault. LP token minted.`,
          })
        }
      >
        Underwrite Vault
      </Button>
    </div>
  );
}
