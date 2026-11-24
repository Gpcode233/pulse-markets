export function DecayStack() {
  // three overlapping bell curves tightening toward tau->0
  // bell(x, mu, sigma, scale) in an SVG viewBox 0 0 480 260
  const W = 480;
  const H = 260;
  const mu = W / 2;
  const base = H - 30;
  const curve = (sigma: number, scale: number) => {
    const pts: string[] = [];
    const N = 120;
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * W;
      const z = (x - mu) / sigma;
      const y = base - scale * Math.exp(-0.5 * z * z);
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return `M ${pts.join(" L ")}`;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      {/* baseline */}
      <line x1="0" y1={base} x2={W} y2={base} stroke="#e6e6ea" strokeWidth="1" />
      {/* T-48h — wide, low */}
      <path d={curve(120, 130)} fill="none" stroke="#7dd3fc" strokeWidth="2" opacity="0.9" />
      {/* T-6h — medium */}
      <path d={curve(60, 170)} fill="none" stroke="#2e7f60" strokeWidth="2" opacity="0.9" />
      {/* T-0 — tight, tall */}
      <path d={curve(22, 200)} fill="none" stroke="#111a4a" strokeWidth="2.25" />

      {/* labels */}
      <g fontFamily="var(--font-geist-mono), ui-monospace, monospace" fontSize="10" fill="#6b7280">
        <text x={mu - 150} y={base - 36} fill="#7dd3fc">T-48h</text>
        <text x={mu - 70} y={base - 92} fill="#2e7f60">T-6h</text>
        <text x={mu + 10} y={base - 170} fill="#111a4a">T-0</text>
        <text x="8" y={base + 18}>price</text>
        <text x={W - 42} y={base + 18}>1.00</text>
        <text x={mu - 4} y={base + 18}>0.50</text>
      </g>
      {/* tick marks */}
      <g stroke="#e6e6ea">
        <line x1={mu} y1={base - 4} x2={mu} y2={base + 4} />
        <line x1={W - 2} y1={base - 4} x2={W - 2} y2={base + 4} />
        <line x1="2" y1={base - 4} x2="2" y2={base + 4} />
      </g>
    </svg>
  );
}
