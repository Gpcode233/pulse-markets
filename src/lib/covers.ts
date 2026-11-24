import { mockShields, type Shield } from "@/lib/mockData";
import { premiumForCoverage } from "@/lib/pmAmm";
import type { ThermalShape } from "@/lib/thermalGl";

/** Plain-language layer over the underlying markets. */
export interface Cover {
  id: string;
  name: string;
  short: string;
  rule: string;
  now: string;
  shape: ThermalShape;
  shield: Shield;
}

const COPY: Record<string, Omit<Cover, "id" | "shield">> = {
  "sol-drawdown-72h": {
    name: "SOL price drop",
    short: "For when you hold SOL and a bad few days would hurt.",
    rule: "Pays if SOL is at or below $142.80 when cover ends.",
    now: "SOL is at $158.67",
    shape: "coin",
  },
  "defi-uptime-48h": {
    name: "Staking outage",
    short: "For when your money sits in Jito or Marinade.",
    rule: "Pays if Jito or Marinade staking stops for 60 minutes or more.",
    now: "Both running normally",
    shape: "servers",
  },
  "eth-gas-weekend": {
    name: "Gas fee spike",
    short: "For when you have to make an Ethereum transaction soon.",
    rule: "Pays if the typical Ethereum gas fee is 120 gwei or more when cover ends.",
    now: "Gas is at 28 gwei",
    shape: "flame",
  },
};

export const covers: Cover[] = mockShields.map((shield) => ({ id: shield.id, shield, ...COPY[shield.id] }));

/** Time left as a share of the cover's own term, as the on-chain program measures it. */
export function timeLeft(shield: Shield, now: number): number {
  return Math.max(0, Math.min(1, (shield.expiryTs - now) / (shield.expiryTs - shield.startTs)));
}

export function priceFor(shield: Shield, payout: number, now: number): number {
  return premiumForCoverage(payout, 1, shield.probability, timeLeft(shield, now), shield.liquidityUsd).premium;
}

export function heatLabel(probability: number): string {
  if (probability < 0.1) return "Very low";
  if (probability < 0.2) return "Low";
  return "Moderate";
}

/** "2 days, 23 hours" — no ticking seconds, nobody needs the stress. */
export function friendlyTime(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const days = Math.floor(hours / 24);
  const h = hours % 24;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
  if (days) return h ? `${plural(days, "day")}, ${plural(h, "hour")}` : plural(days, "day");
  if (hours) return plural(hours, "hour");
  return "Less than an hour";
}

export function endsOn(ts: number): string {
  return new Date(ts).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
}
