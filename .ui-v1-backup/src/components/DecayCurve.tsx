"use client";
import * as React from "react";
import { decayCurve } from "@/lib/pmAmm";

interface Props {
  progress: number; // 0..1 of elapsed
  className?: string;
}

export function DecayCurve({ progress, className }: Props) {
  const pts = React.useMemo(() => decayCurve(48), []);
  const W = 120;
  const H = 36;
  const path =
    "M " +
    pts
      .map((p, i) => `${(i / (pts.length - 1)) * W},${H - p.y * H}`)
      .join(" L ");
  const cx = Math.max(0, Math.min(1, progress)) * W;
  // interpolate y from curve
  const idx = Math.min(pts.length - 2, Math.floor((cx / W) * (pts.length - 1)));
  const cy = H - pts[idx].y * H;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} aria-hidden>
      <defs>
        <linearGradient id="dc" x1="0" x2="1">
          <stop offset="0" stopColor="#44b48b" stopOpacity="0.9" />
          <stop offset="1" stopColor="#44b48b" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#dc)" strokeWidth={1.75} strokeLinecap="round" />
      <path
        d={`${path} L ${W},${H} L 0,${H} Z`}
        fill="#44b48b"
        fillOpacity="0.06"
      />
      <circle cx={cx} cy={cy} r={3} fill="#2e7f60" />
    </svg>
  );
}
