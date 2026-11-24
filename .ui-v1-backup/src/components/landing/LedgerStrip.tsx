const rows = [
  {
    asset: "SOL",
    trigger: "-10% / 72h",
    premium: "$14.80",
    tau: "71h 48m",
    prob: "7.40%",
  },
  {
    asset: "mSOL",
    trigger: "depeg > 2%",
    premium: "$8.42",
    tau: "47h 12m",
    prob: "4.21%",
  },
  {
    asset: "ETH gas",
    trigger: "> 120 gwei / 24h",
    premium: "$22.60",
    tau: "23h 05m",
    prob: "11.30%",
  },
];

export function LedgerStrip() {
  return (
    <div
      className="w-full bg-white border border-silver-lining rounded-[12px] overflow-hidden"
      style={{ boxShadow: "var(--shadow-xl-2)" }}
    >
      <div className="flex items-center justify-between px-6 py-3 border-b border-silver-lining bg-[#fafbfc]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-seafoam-500 animate-pulse" />
          <span className="text-[11px] font-medium tracking-wider text-seafoam-700 tabular font-mono">
            LIVE · DEVNET
          </span>
        </div>
        <span className="text-[11px] text-muted-ink tabular font-mono">
          shields.stream · pyth-mainnet-beta
        </span>
      </div>
      <div className="grid grid-cols-5 px-6 py-2 text-[10px] uppercase tracking-wider text-muted-ink border-b border-silver-lining">
        <span>Asset</span>
        <span>Trigger</span>
        <span className="text-right">Premium</span>
        <span className="text-right">τ</span>
        <span className="text-right">Implied p</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="grid grid-cols-5 px-6 py-3 items-center text-[13px] tabular font-mono border-b border-silver-lining last:border-b-0 hover:bg-[#fafbfc] transition-colors"
        >
          <span className="text-indigo-ink font-medium">{r.asset}</span>
          <span className="text-muted-ink">{r.trigger}</span>
          <span className="text-right text-seafoam-700">{r.premium}</span>
          <span className="text-right text-indigo-ink">{r.tau}</span>
          <span className="text-right text-seafoam-700">{r.prob}</span>
        </div>
      ))}
    </div>
  );
}
