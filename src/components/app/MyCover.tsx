"use client";
import { Button } from "@/components/ui/button";
import { Thermal } from "@/components/thermal/Thermal";
import { endsOn, type Cover } from "@/lib/covers";
import { formatUsd } from "@/lib/utils";

export interface Holding {
  id: number;
  cover: Cover;
  payout: number;
  price: number;
  status: "active" | "ready" | "paid";
}

const STATUS = {
  active: ["Covered", "bg-indigo-navy/8 text-indigo-ink"],
  ready: ["Ready to claim", "bg-signal-orange-soft text-[#9c2a0c]"],
  paid: ["Paid", "bg-seafoam-50 text-seafoam-700"],
} as const;

interface Props {
  holdings: Holding[];
  onSimulate: (id: number) => void;
  onClaim: (id: number) => void;
  onBrowse: () => void;
}

export function MyCover({ holdings, onSimulate, onClaim, onBrowse }: Props) {
  if (!holdings.length) {
    return (
      <div className="panel px-6 pb-14 pt-6 text-center">
        <Thermal shape="umbrella" className="mx-auto aspect-square w-full max-w-[280px]" />
        <h2 className="text-[30px] font-semibold">Nothing covered yet</h2>
        <p className="mx-auto mt-2 max-w-[40ch] text-[17px] text-muted-ink">When you get cover, you can track it and claim your payout here.</p>
        <Button variant="orange" size="lg" className="mt-6" onClick={onBrowse}>Choose a cover</Button>
      </div>
    );
  }
  const active = holdings.filter((h) => h.status !== "paid");
  return (
    <>
      <p className="text-[17px] text-muted-ink">Total you could receive <b className="tabular ml-2 text-indigo-ink">{formatUsd(active.reduce((s, h) => s + h.payout, 0), 0)}</b></p>
      <ul className="mt-5 grid gap-4">
        {holdings.map((h) => (
          <li key={h.id} className="panel grid items-center gap-5 p-3 sm:grid-cols-[150px_1fr_auto]">
            <span className="block overflow-hidden rounded-[17px] bg-[#e4e7f5]"><Thermal shape={h.cover.shape} className="h-[130px] w-full" /></span>
            <div className="px-2">
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${STATUS[h.status][1]}`}>{STATUS[h.status][0]}</span>
              <h2 className="mt-2 text-[24px] font-semibold">{h.cover.name}</h2>
              <p className="mt-1 text-[15px] text-muted-ink">{h.cover.rule}</p>
              <p className="tabular mt-2 text-[15px]">Paid {formatUsd(h.price)}. Pays {formatUsd(h.payout, 0)}. Until {endsOn(h.cover.shield.expiryTs)}.</p>
            </div>
            <div className="p-2 sm:pr-5">
              {h.status === "active" && <Button variant="secondary" className="w-full" onClick={() => onSimulate(h.id)}>Demo: make it happen</Button>}
              {h.status === "ready" && <Button variant="orange" size="lg" className="w-full" onClick={() => onClaim(h.id)}>Claim {formatUsd(h.payout, 0)}</Button>}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
