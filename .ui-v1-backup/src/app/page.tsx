import Link from "next/link";
import { TopNav } from "@/components/TopNav";
import { HalftoneBg } from "@/components/landing/HalftoneBg";
import { HeroWidget } from "@/components/landing/HeroWidget";
import { DecayStack } from "@/components/landing/DecayStack";
import { LedgerStrip } from "@/components/landing/LedgerStrip";
import {
  IconArrowRight,
  IconBolt,
  IconMathFunction,
  IconCircleCheck,
  IconChartLine,
  IconShieldCheck,
  IconFlame,
  IconDatabase,
  IconNetwork,
  IconCode,
  IconSparkles,
  IconChevronRight,
} from "@tabler/icons-react";

const PRIMARY_PILL =
  "inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-indigo-navy text-white text-[15px] font-medium transition-opacity hover:opacity-90 shadow-[0_1px_2px_rgba(16,24,40,0.08)]";
const SECONDARY_PILL =
  "inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-transparent border border-indigo-navy text-indigo-navy text-[15px] font-medium transition-colors hover:bg-indigo-navy/5";

export default function LandingPage() {
  return (
    <>
      <TopNav />
      <main className="relative">
        {/* ----- HERO ----- */}
        <section className="relative overflow-hidden">
          <HalftoneBg />
          <div className="relative mx-auto max-w-[1200px] px-6 pt-24 pb-28">
            <div className="grid grid-cols-12 gap-10 items-center">
              <div className="col-span-12 lg:col-span-7">
                <span className="fade-in-up inline-flex items-center gap-2 text-[12px] font-medium tracking-wider uppercase text-seafoam-700 tabular font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-seafoam-500 animate-pulse" />
                  Live on Solana Devnet · Pyth-settled
                </span>
                <h1
                  className="fade-in-up mt-5 text-[56px] sm:text-[64px] lg:text-[72px] leading-[1.02] tracking-[-0.025em] font-medium text-indigo-ink"
                >
                  Hedge Solana shocks
                  <br />
                  in 48 hours.
                </h1>
                <p className="fade-in-up-delay-1 mt-6 max-w-[560px] text-[17px] leading-[1.55] text-muted-ink">
                  Parametric micro-insurance on a time-aware pm-AMM.
                  100% USDC-collateralized. Pyth-settled. Zero adjusters.
                </p>
                <div className="fade-in-up-delay-2 mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/app" className={PRIMARY_PILL}>
                    Launch App <IconArrowRight size={16} />
                  </Link>
                  <a
                    href="https://www.predict-pm-amm.dev"
                    target="_blank"
                    rel="noreferrer"
                    className={SECONDARY_PILL}
                  >
                    Read the pm-AMM paper
                  </a>
                </div>
                <div className="fade-in-up-delay-3 mt-7 flex items-center gap-5 text-[12px] text-muted-ink">
                  <span className="inline-flex items-center gap-1.5">
                    <IconShieldCheck size={14} className="text-seafoam-700" />
                    1:1 reserves
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <IconBolt size={14} className="text-seafoam-700" />
                    &lt;2s settlement
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <IconCircleCheck size={14} className="text-seafoam-700" />
                    No adjusters
                  </span>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-5 flex lg:justify-end">
                <div className="fade-in-up-delay-2">
                  <HeroWidget />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ----- TRUST STRIP ----- */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { v: "$2.4M+", l: "Protected notional" },
              { v: "100.0%", l: "USDC reserve ratio" },
              { v: "<2s", l: "Pyth settlement" },
              { v: "47h", l: "Avg shield duration" },
            ].map((k) => (
              <div key={k.l} className="flex flex-col">
                <span className="text-[28px] font-medium tracking-[-0.02em] text-seafoam-700 tabular font-mono">
                  {k.v}
                </span>
                <span className="mt-1 text-[14px] text-muted-ink">{k.l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ----- HOW IT WORKS ----- */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="max-w-[720px]">
            <span className="text-[12px] uppercase tracking-wider text-muted-ink tabular font-mono">
              How it works
            </span>
            <h2 className="mt-3 text-[40px] sm:text-[48px] leading-[1.05] tracking-[-0.022em] font-medium text-indigo-ink">
              Three steps between shock and payout.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                icon: IconBolt,
                h: "Pick your shock",
                b: "Choose the Solana risk you want gone — SOL drawdown, DeFi protocol downtime, Ethereum gas spike. Trigger, duration, size.",
              },
              {
                n: "02",
                icon: IconMathFunction,
                h: "pm-AMM prices your premium",
                b: "A time-aware Gaussian liquidity curve tightens as expiry nears, so LPs never get stale-quoted and underwriters earn real yield.",
              },
              {
                n: "03",
                icon: IconCircleCheck,
                h: "Pyth resolves on-chain",
                b: "On trigger, YES redeems $1 instantly. No adjusters, no claims form, no email. Just a Pyth price update and a USDC transfer.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="bg-white border border-silver-lining rounded-[10px] p-7 transition-shadow hover:shadow-md"
                style={{ boxShadow: "var(--shadow-hairline)" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-muted-ink tabular font-mono">
                    {s.n}
                  </span>
                  <s.icon size={20} className="text-indigo-navy" />
                </div>
                <h3 className="mt-6 text-[20px] font-medium tracking-[-0.015em] text-indigo-ink">
                  {s.h}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-muted-ink">{s.b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ----- pm-AMM MATH SHOWCASE ----- */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[12px] uppercase tracking-wider text-muted-ink tabular font-mono">
                pm-AMM · Gaussian liquidity
              </span>
              <h2 className="mt-3 text-[36px] sm:text-[44px] leading-[1.08] tracking-[-0.022em] font-medium text-indigo-ink">
                Why a pm-AMM beats x·y=k for short-horizon binary events.
              </h2>
              <div className="mt-6 space-y-4 text-[15px] leading-[1.65] text-muted-ink">
                <p>
                  Constant-product curves treat every moment the same.
                  For a 72-hour shield, that is nonsense — the moneyness window
                  collapses as expiry approaches, and so should the liquidity.
                </p>
                <p>
                  A pm-AMM concentrates depth as a Gaussian around the current
                  implied probability, with width scaling as{" "}
                  <span className="font-mono text-indigo-ink">τ = max(0, T−t)</span>.
                  When τ is small, the curve is tall and narrow: tight spreads,
                  honest prices, minimal Loss-vs-Rebalancing for LPs.
                </p>
                <p>
                  LVR — the hidden tax on passive AMMs — is bounded and
                  path-independent here. Underwriters earn premiums that match
                  real realized risk, not toxic flow.
                </p>
                <p>
                  Result: capital efficiency a constant-product pool cannot
                  reach, with the same simple two-sided book LPs already know.
                </p>
              </div>
            </div>

            <div
              className="bg-white border border-silver-lining rounded-[10px] p-6"
              style={{ boxShadow: "var(--shadow-hairline)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase tracking-wider text-muted-ink tabular font-mono">
                  Liquidity depth · τ → 0
                </span>
                <IconChartLine size={16} className="text-indigo-navy" />
              </div>
              <DecayStack />
              <div className="mt-4 pt-4 border-t border-silver-lining grid grid-cols-3 gap-3 text-[11px]">
                <div>
                  <div className="h-0.5 w-6 bg-sky-300 mb-1" />
                  <span className="text-muted-ink tabular font-mono">τ=48h · wide</span>
                </div>
                <div>
                  <div className="h-0.5 w-6 bg-seafoam-500 mb-1" />
                  <span className="text-muted-ink tabular font-mono">τ=6h · tightening</span>
                </div>
                <div>
                  <div className="h-0.5 w-6 bg-indigo-navy mb-1" />
                  <span className="text-muted-ink tabular font-mono">τ=0 · resolved</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ----- LIVE SHIELD PREVIEW STRIP ----- */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[12px] uppercase tracking-wider text-muted-ink tabular font-mono">
                Devnet telemetry
              </span>
              <h2 className="mt-2 text-[32px] leading-[1.1] tracking-[-0.02em] font-medium text-indigo-ink">
                Shields minting right now.
              </h2>
            </div>
            <Link
              href="/app"
              className="hidden sm:inline-flex items-center gap-1 text-[13px] font-medium text-indigo-navy hover:underline"
            >
              See full book <IconChevronRight size={14} />
            </Link>
          </div>
          <LedgerStrip />
        </section>

        {/* ----- USE CASES ----- */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="max-w-[640px]">
            <span className="text-[12px] uppercase tracking-wider text-muted-ink tabular font-mono">
              Who buys shields
            </span>
            <h2 className="mt-3 text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.022em] font-medium text-indigo-ink">
              Built for operators who run real positions.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: IconChartLine,
                h: "SOL Treasury Hedge",
                b: "Cap drawdown on your DAO treasury. Mint a 72-hour SOL −10% shield before unlock windows and governance votes.",
              },
              {
                icon: IconNetwork,
                h: "DeFi Protocol Cover",
                b: "Insure against counterparty downtime. Trigger on a Pyth protocol-health feed so recovery is automatic.",
              },
              {
                icon: IconFlame,
                h: "Gas Spike Shield",
                b: "Hedge Ethereum base fee before a weekend deploy. Pay $12, collect if gwei blows past your threshold.",
              },
            ].map((c) => (
              <div
                key={c.h}
                className="bg-white border border-silver-lining rounded-[10px] p-7 transition-shadow hover:shadow-md"
                style={{ boxShadow: "var(--shadow-hairline)" }}
              >
                <c.icon size={22} className="text-indigo-navy" />
                <h3 className="mt-5 text-[22px] font-medium tracking-[-0.015em] text-indigo-ink">
                  {c.h}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-muted-ink">{c.b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ----- UNDERWRITE ACCENT CARD (THE ONE ORANGE) ----- */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div
            className="relative overflow-hidden rounded-[14px] bg-signal-orange text-white px-10 py-14 sm:px-14 sm:py-16"
            style={{ boxShadow: "var(--shadow-xl-2)" }}
          >
            {/* soft texture */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-[320px] w-[320px] rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(255,255,255,0.25), rgba(255,255,255,0))",
              }}
            />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8">
                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider font-medium tabular font-mono opacity-90">
                  <IconSparkles size={13} /> For LPs & underwriters
                </span>
                <h2 className="mt-4 text-[40px] sm:text-[52px] leading-[1.05] tracking-[-0.022em] font-medium">
                  Underwrite the pool.
                  <br />
                  Earn real yield from real risk.
                </h2>
                <p className="mt-5 max-w-[620px] text-[16px] leading-[1.55] opacity-90">
                  Deposit USDC into the pm-AMM vault. Earn premiums from every
                  shield minted. 100% collateralization, no IL math, no toxic
                  flow — just paid when the shock doesn&apos;t happen.
                </p>
              </div>
              <div className="lg:col-span-4 flex lg:justify-end">
                <Link
                  href="/app"
                  className="inline-flex items-center gap-2 h-12 px-6 rounded-[8px] bg-white text-signal-orange text-[15px] font-medium transition-opacity hover:opacity-90"
                >
                  Open Underwrite Tab <IconArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ----- DEV / STACK STRIP ----- */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <span className="text-[12px] uppercase tracking-wider text-muted-ink tabular font-mono">
            Built on
          </span>
          <div className="mt-6 flex flex-wrap items-center gap-x-12 gap-y-6">
            {[
              { icon: IconBolt, l: "Solana" },
              { icon: IconCode, l: "Anchor" },
              { icon: IconDatabase, l: "Pyth Network" },
              { icon: IconMathFunction, l: "pm-AMM Spec" },
            ].map((s) => (
              <div
                key={s.l}
                className="inline-flex items-center gap-2 text-[16px] font-medium tracking-[-0.01em] text-indigo-ink"
              >
                <s.icon size={18} className="text-muted-ink" />
                {s.l}
              </div>
            ))}
          </div>
        </section>

        {/* ----- FAQ ----- */}
        <section className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <span className="text-[12px] uppercase tracking-wider text-muted-ink tabular font-mono">
                FAQ
              </span>
              <h2 className="mt-3 text-[36px] leading-[1.08] tracking-[-0.022em] font-medium text-indigo-ink">
                The short version.
              </h2>
            </div>
            <div className="lg:col-span-8">
              {[
                {
                  q: "What is a parametric shield?",
                  a: "A tokenized insurance contract that pays a fixed USDC amount if a pre-defined on-chain trigger fires before expiry. No claims form. No adjuster. Just a Pyth price update.",
                },
                {
                  q: "How is my premium priced?",
                  a: "A time-aware pm-AMM quotes an implied probability of your shock. Premium = notional × implied-p × fee multiplier. Depth tightens as τ → 0 so you always get an honest mid.",
                },
                {
                  q: "What happens if the oracle breaks?",
                  a: "The protocol pauses settlement on a Pyth confidence-interval breach. Reserves stay 1:1 USDC. You can always exit at current mid or wait for the feed to recover.",
                },
                {
                  q: "Can I exit before expiry?",
                  a: "Yes. Shields are tradable against the pm-AMM at any time. The curve gives you a fair mid; slippage shrinks as more capital is underwritten.",
                },
                {
                  q: "Where does my USDC sit?",
                  a: "In the on-chain Pulse vault, a Solana program-derived address. 100% collateralization of outstanding YES notional, fully auditable on devnet.",
                },
              ].map((f, i) => (
                <details
                  key={i}
                  className="group border-b border-silver-lining py-5 cursor-pointer"
                >
                  <summary className="flex items-center justify-between list-none">
                    <span className="text-[17px] font-medium tracking-[-0.01em] text-indigo-ink">
                      {f.q}
                    </span>
                    <IconChevronRight
                      size={18}
                      className="text-muted-ink transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <p className="mt-3 pr-8 text-[14px] leading-[1.65] text-muted-ink">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ----- FINAL CTA BAND ----- */}
        <section className="mx-auto max-w-[1200px] px-6 py-24">
          <div className="text-center max-w-[820px] mx-auto">
            <h2 className="text-[44px] sm:text-[56px] leading-[1.04] tracking-[-0.025em] font-medium text-indigo-ink">
              Settle risk at the speed of Solana.
            </h2>
            <p className="mt-5 text-[17px] text-muted-ink">
              One click to mint. Two seconds to settle. Zero adjusters.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/app" className={PRIMARY_PILL}>
                Launch Pulse Shields <IconArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* ----- FOOTER ----- */}
        <footer className="border-t border-silver-lining">
          <div className="mx-auto max-w-[1200px] px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px] text-muted-ink">
            <span>
              Pulse Markets · built for Solana Perps &amp; Prediction Markets hackathon · Devnet
            </span>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-indigo-ink transition-colors">
                Docs
              </a>
              <a href="#" className="hover:text-indigo-ink transition-colors">
                GitHub
              </a>
              <a
                href="https://www.predict-pm-amm.dev"
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-ink transition-colors"
              >
                pm-AMM spec
              </a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
