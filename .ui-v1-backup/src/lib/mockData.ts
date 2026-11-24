export type ShieldStatus = "ACTIVE" | "TRIGGERED" | "EXPIRED";

export interface Shield {
  id: string;
  title: string;
  subtitle: string;
  asset: string;
  trigger: string;
  thresholdLabel: string;
  currentValue: string;
  expiryTs: number; // ms
  startTs: number; // ms
  probability: number; // 0..1 implied
  liquidityUsd: number;
  tvlUsd: number;
  status: ShieldStatus;
  featured?: boolean;
}

const now = Date.now();
const H = 3_600_000;

export const mockShields: Shield[] = [
  {
    id: "sol-drawdown-72h",
    title: "72h SOL −10% Drawdown Shield",
    subtitle: "Pays $1 per share if SOL/USD closes ≥10% below strike within 72h.",
    asset: "SOL/USD",
    trigger: "Pyth: SOL/USD close",
    thresholdLabel: "Strike $142.80 · −10%",
    currentValue: "$158.67",
    expiryTs: now + 71 * H + 18 * 60_000 + 9_000,
    startTs: now - 1 * H,
    probability: 0.22,
    liquidityUsd: 840_000,
    tvlUsd: 1_120_000,
    status: "ACTIVE",
  },
  {
    id: "defi-uptime-48h",
    title: "DeFi Protocol Uptime Cover",
    subtitle: "Pays $1 per share if Jito or Marinade staking halts ≥60 min in 48h.",
    asset: "Jito + Marinade",
    trigger: "Validator heartbeat RPC",
    thresholdLabel: "Halt ≥60 min",
    currentValue: "Healthy · 0 incidents",
    expiryTs: now + 47 * H + 42 * 60_000 + 44_000,
    startTs: now - 1 * H,
    probability: 0.08,
    liquidityUsd: 460_000,
    tvlUsd: 620_000,
    status: "ACTIVE",
  },
  {
    id: "eth-gas-weekend",
    title: "Weekend ETH Gas Spike Shield",
    subtitle: "Pays $1 per share if ETH gas median closes ≥120 gwei Sat–Sun.",
    asset: "ETH gas median",
    trigger: "Pyth: ETH gas index",
    thresholdLabel: "≥120 gwei median",
    currentValue: "28 gwei · calm",
    expiryTs: now + 63 * H + 5 * 60_000 + 11_000,
    startTs: now - 1 * H,
    probability: 0.16,
    liquidityUsd: 310_000,
    tvlUsd: 420_000,
    status: "ACTIVE",
    featured: true,
  },
];

export const kpis = {
  tvp: 2_400_000, // total value protected
  reserveRatio: 1.0, // 100.0% USDC backing
  activeShields: 12,
};

export function totalLiquidity(): number {
  return mockShields.reduce((s, x) => s + x.liquidityUsd, 0);
}
