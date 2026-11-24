"use client";
import { useEffect, useState } from "react";

export function useCountdown(expiryTs: number) {
  const [now, setNow] = useState<number>(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, expiryTs - now);
  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number, w = 2) => n.toString().padStart(w, "0");
  const label = `${pad(h)}h:${pad(m)}m:${pad(s)}s`;
  const totalSpanMs = 72 * 3_600_000;
  const tau = Math.max(0, Math.min(1, diff / totalSpanMs));
  return { label, h, m, s, diffMs: diff, tau, expired: diff === 0 };
}
