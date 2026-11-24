"use client";
import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false, loading: () => <span className="h-[42px] w-[140px] rounded-full bg-indigo-navy" /> },
);

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5 font-[family-name:var(--font-display)] text-[22px] font-semibold tracking-[-0.035em]">
      <span aria-hidden className="h-7 w-7 rounded-full" style={{ background: "radial-gradient(circle at 65% 30% in oklch, #ffd75e, #ff5a1f 32%, #d4267f 58%, #351cb0 85%)" }} />
      Pulse
    </span>
  );
}

const LINKS = [
  ["/#covers", "Covers"],
  ["/#how", "How it works"],
  ["/#earn", "Earn"],
  ["/#questions", "Questions"],
];

export function TopNav() {
  const inApp = usePathname().startsWith("/app");
  return (
    <header className="sticky top-0 z-40 border-b border-silver-lining bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-4 px-5">
        <Link href="/" aria-label="Pulse home"><Logo /></Link>
        {!inApp && (
          <nav aria-label="Main" className="hidden gap-8 text-[15px] font-medium md:flex">
            {LINKS.map(([href, label]) => (
              <a key={href} href={href} className="underline-offset-[0.3em] hover:underline">{label}</a>
            ))}
          </nav>
        )}
        {inApp ? (
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-indigo-navy/8 px-3 py-1.5 text-sm font-medium sm:block">Demo, no real money</span>
            <WalletMultiButton />
          </div>
        ) : (
          <Link href="/app" className="press rounded-full bg-indigo-navy px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-[#262b63]">Open app</Link>
        )}
      </div>
    </header>
  );
}
