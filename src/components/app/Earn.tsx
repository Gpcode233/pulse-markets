"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Thermal } from "@/components/thermal/Thermal";
import { useToast } from "@/components/ui/toast";
import { formatUsd } from "@/lib/utils";

// Example pool figures for the demo.
const POOL = 1_610_000;
const WEEKLY_PAYMENTS = 18_400;

export function Earn() {
  const [amount, setAmount] = React.useState("1000");
  const { push } = useToast();
  const value = Math.max(0, Number(amount) || 0);
  const weekly = WEEKLY_PAYMENTS * (value / (POOL + value));

  return (
    <div className="grid items-stretch gap-6 lg:grid-cols-2">
      <div className="flex flex-col overflow-hidden rounded-[28px] bg-indigo-navy text-white">
        <div className="p-7 sm:p-10">
          <h2 className="text-[28px] font-semibold leading-tight sm:text-[34px]">Fund the pool, share the payments</h2>
          <p className="mt-4 max-w-[44ch] text-[17px] leading-relaxed text-white/80">People pay for cover. Those payments go to the pool. If a claim pays out, it comes from the pool.</p>
        </div>
        <Thermal shape="lifebuoy" className="mx-auto mt-auto aspect-square w-full max-w-[240px] pb-6 sm:max-w-[340px]" />
      </div>
      <form className="panel flex flex-col p-6 sm:p-9" onSubmit={(e) => { e.preventDefault(); push({ variant: "success", title: "Added in demo", description: `${formatUsd(value, 0)} added to the example pool. No real money moved.` }); }}>
        <Label htmlFor="amount">How much would you add?</Label>
        <div className="relative mt-3">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-muted-ink">$</span>
          <Input id="amount" type="number" inputMode="decimal" min={1} required value={amount} onChange={(e) => setAmount(e.target.value)} className="tabular h-16 pl-9 text-2xl font-semibold" />
        </div>
        <dl className="mt-6 rounded-[17px] bg-canvas p-5">
          <dt className="text-muted-ink">Your share of payments in an example week</dt>
          <dd className="tabular mt-1 text-[34px] font-semibold">{formatUsd(weekly)}</dd>
          <dd className="mt-1 text-sm text-muted-ink">Before any claims. Example figures, not a forecast.</dd>
        </dl>
        <p className="my-6 text-[16px] leading-relaxed"><b>You can lose money.</b> A large claim could take some or all of what you add.</p>
        <Button type="submit" variant="orange" size="lg" className="mt-auto h-14 w-full text-[17px]" disabled={value <= 0}>Add {formatUsd(value, 0)}</Button>
      </form>
    </div>
  );
}
