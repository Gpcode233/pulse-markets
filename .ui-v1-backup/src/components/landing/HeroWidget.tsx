import { IconShieldCheck, IconBolt } from "@tabler/icons-react";

export function HeroWidget() {
  // mini gaussian decay sparkline
  const W = 340;
  const H = 54;
  const mu = W * 0.72;
  const sigma = 60;
  const base = H - 4;
  const pts: string[] = [];
  const N = 80;
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * W;
    const z = (x - mu) / sigma;
    const y = base - 42 * Math.exp(-0.5 * z * z);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const d = `M ${pts.join(" L ")}`;
  const area = `${d} L ${W},${base} L 0,${base} Z`;

  return (
    <div
      className="w-[400px] max-w-full bg-white border border-silver-lining rounded-[12px] p-5"
      style={{ boxShadow: "var(--shadow-xl-2)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[6px] bg-indigo-navy inline-flex items-center justify-center text-white">
            <IconShieldCheck size={15} />
          </div>
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-indigo-ink tracking-[-0.01em]">
              SOL 72h -10% Shield
            </span>
            <span className="text-[11px] text-muted-ink tabular font-mono">SHLD-SOL-72h-10</span>
          </div>
        </div>
        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-seafoam-50 text-seafoam-700 inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-seafoam-500 animate-pulse" />
          ACTIVE
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-ink">Protected</span>
          <span className="text-[17px] font-medium text-indigo-ink tabular font-mono">$2,000</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-ink">Premium</span>
          <span className="text-[17px] font-medium text-indigo-ink tabular font-mono">$14.80</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-muted-ink">Payout</span>
          <span className="text-[17px] font-medium text-seafoam-700 tabular font-mono">$200.00</span>
        </div>
      </div>

      <div className="mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[54px]">
          <defs>
            <linearGradient id="hwFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2e7f60" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2e7f60" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#hwFill)" />
          <path d={d} fill="none" stroke="#2e7f60" strokeWidth="1.75" />
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-ink">
        <span className="inline-flex items-center gap-1 tabular font-mono">
          <IconBolt size={12} className="text-signal-orange" />
          1:1 USDC-backed · Pyth-settled
        </span>
        <span className="tabular font-mono">τ = 71h 48m</span>
      </div>
    </div>
  );
}
