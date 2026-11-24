"use client";
import * as React from "react";
import { IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { HeatGauge } from "@/components/HeatGauge";
import { Thermal } from "@/components/thermal/Thermal";
import { covers, endsOn, friendlyTime, priceFor, type Cover } from "@/lib/covers";
import { cn, formatUsd } from "@/lib/utils";

const AMOUNTS = [100, 500, 1000, 5000];

interface Props {
  now: number;
  selected: Cover;
  onSelect: (id: string) => void;
  onBuy: (cover: Cover, payout: number, price: number) => void;
  onDone: () => void;
}

export function GetCover({ now, selected, onSelect, onBuy, onDone }: Props) {
  const [payout, setPayout] = React.useState(500);
  const [step, setStep] = React.useState<"closed" | "review" | "done">("closed");
  const [quoted, setQuoted] = React.useState(0);
  const quoteRef = React.useRef<HTMLElement>(null);
  const price = priceFor(selected.shield, payout, now);
  const ended = selected.shield.expiryTs <= now;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div role="group" aria-label="Choose a risk" className="grid gap-4">
        {covers.map((c) => {
          const on = c.id === selected.id;
          return (
            <button
              key={c.id}
              aria-pressed={on}
              onClick={() => {
                onSelect(c.id);
                // On phones the quote sits below the list, so bring it to the person.
                if (window.matchMedia("(max-width: 1023px)").matches) quoteRef.current?.scrollIntoView({ block: "start" });
              }}
              className={cn("panel press grid w-full grid-cols-[84px_minmax(0,1fr)] gap-x-4 gap-y-3 p-3 text-left sm:grid-cols-[170px_minmax(0,1fr)] sm:gap-x-6", on ? "border-signal-orange ring-1 ring-signal-orange" : "hover:border-indigo-navy/40")}
            >
              <span className="block h-[84px] self-start overflow-hidden rounded-[17px] bg-[#e4e7f5] sm:row-span-2 sm:h-full">
                <Thermal shape={c.shape} className="h-full w-full" />
              </span>
              <span className="block min-w-0 pr-1 pt-1 sm:pr-2 sm:pt-2">
                <span className="flex items-start justify-between gap-3">
                  <span className="font-[family-name:var(--font-display)] text-[20px] font-semibold leading-tight tracking-[-0.03em] sm:text-[22px]">{c.name}</span>
                  <span aria-hidden className={cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border", on ? "border-signal-orange bg-signal-orange text-white" : "border-indigo-navy/30")}>
                    {on && <IconCheck size={15} stroke={3} />}
                  </span>
                </span>
                <span className="mt-1 block text-[15px] leading-relaxed text-muted-ink">{c.rule}</span>
              </span>
              <span className="col-span-2 block px-1 pb-1 sm:col-span-1 sm:col-start-2 sm:px-0 sm:pb-2 sm:pr-2">
                <HeatGauge probability={c.shield.probability} />
                <span className="mt-3 block text-sm text-muted-ink">{c.now}. Ends in {friendlyTime(c.shield.expiryTs - now).toLowerCase()}.</span>
              </span>
            </button>
          );
        })}
      </div>

      <section ref={quoteRef} aria-label="Your quote" className="panel p-2 sm:p-3 shadow-[var(--shadow-xl-2)] lg:sticky lg:top-[96px]">
        <div className="p-4 sm:p-5">
          <h2 className="text-[26px] font-semibold">{selected.name}</h2>
          <p id="payout-label" className="mt-5 font-semibold">How much would you want to receive?</p>
          <p className="tabular mt-2 font-[family-name:var(--font-display)] text-[46px] font-semibold sm:text-[56px] leading-none tracking-[-0.045em]">{formatUsd(payout, 0)}</p>
          <Slider aria-labelledby="payout-label" className="mt-6" min={100} max={5000} step={50} value={[payout]} onValueChange={([v]) => setPayout(v)} />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <button key={a} aria-pressed={a === payout} onClick={() => setPayout(a)} className={cn("press tabular rounded-full border py-2.5 text-[15px] font-semibold", a === payout ? "border-indigo-navy bg-indigo-navy text-white" : "border-silver-lining hover:border-indigo-navy/40")}>
                {formatUsd(a, 0)}
              </button>
            ))}
          </div>
        </div>
        <dl className="rounded-[17px] bg-canvas p-5 text-[16px]">
          <div className="flex items-baseline justify-between"><dt>You pay today</dt><dd className="tabular text-[26px] font-semibold">{formatUsd(price)}</dd></div>
          <div className="mt-3 flex justify-between"><dt className="text-muted-ink">If it happens, you get</dt><dd className="tabular font-semibold text-seafoam-700">{formatUsd(payout, 0)}</dd></div>
          <div className="mt-3 flex justify-between gap-4"><dt className="text-muted-ink">Covered until</dt><dd className="text-right font-semibold">{endsOn(selected.shield.expiryTs)}</dd></div>
        </dl>
        <div className="px-2 pb-2 pt-4">
          <Button variant="orange" size="lg" className="h-14 w-full text-[17px]" disabled={ended} onClick={() => { setQuoted(price); setStep("review"); }}>
            {ended ? "This cover has ended" : "Review cover"}
          </Button>
          <details className="mt-3 px-2 text-[15px]">
            <summary className="list-none py-2 font-semibold underline underline-offset-[0.25em]">How is my price set?</summary>
            <p className="pb-2 leading-relaxed text-muted-ink">It follows how likely the event looks and how much time is left. If it doesn’t happen, you don’t get your payment back.</p>
          </details>
        </div>
      </section>

      <Dialog open={step !== "closed"} onOpenChange={(o) => !o && setStep("closed")}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto">
          {step === "done" ? (
            <div className="text-center">
              <Thermal shape="umbrella" className="mx-auto aspect-square w-[220px]" />
              <DialogTitle className="text-[32px]">You’re covered</DialogTitle>
              <DialogDescription className="mt-2 text-[16px]">
                {formatUsd(payout, 0)} for {selected.name.toLowerCase()}, until {endsOn(selected.shield.expiryTs)}. This is a demo, so nothing was charged.
              </DialogDescription>
              <Button size="lg" className="mt-6 w-full" onClick={() => { setStep("closed"); onDone(); }}>See my cover</Button>
            </div>
          ) : (
            <>
              <DialogTitle>Check your cover</DialogTitle>
              <DialogDescription className="mt-2 text-[16px] leading-relaxed">{selected.rule}</DialogDescription>
              <dl className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-[18px] bg-canvas p-4"><dt className="text-sm text-muted-ink">You pay</dt><dd className="tabular text-2xl font-semibold">{formatUsd(quoted)}</dd></div>
                <div className="rounded-[18px] bg-seafoam-50 p-4 text-seafoam-700"><dt className="text-sm">You could get</dt><dd className="tabular text-2xl font-semibold">{formatUsd(payout, 0)}</dd></div>
              </dl>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-ink">
                If it doesn’t happen by {endsOn(selected.shield.expiryTs)}, you lose the {formatUsd(quoted)} you paid. This is a prediction market event contract, not an insurance policy.
              </p>
              <Button variant="orange" size="lg" className="mt-6 h-14 w-full text-[17px]" onClick={() => { onBuy(selected, payout, quoted); setStep("done"); }}>
                Get covered for {formatUsd(quoted)}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
