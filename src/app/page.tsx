import Link from "next/link";
import { IconArrowRight, IconPlus } from "@tabler/icons-react";
import { Logo, TopNav } from "@/components/TopNav";
import { HeatGauge } from "@/components/HeatGauge";
import { Thermal } from "@/components/thermal/Thermal";
import { covers, priceFor } from "@/lib/covers";
import { formatUsd } from "@/lib/utils";

const EMBER = "press inline-flex items-center justify-center gap-2 rounded-full bg-signal-orange px-7 py-4 text-[17px] font-semibold text-white hover:bg-[#b92f0c]";

const STEPS = [
  ["Pick what worries you", "A price drop, an outage or a fee spike. Every cover has one clear rule."],
  ["Choose your payout", "Set how much you want to receive. You see the full price before you agree."],
  ["Get paid if it happens", "If the rule is met when cover ends, you claim the amount you chose. No forms or receipts."],
];

const FAQ = [
  ["What am I actually buying?", "A contract with a fixed payout. If the event in its rule happens, you can claim the payout. If it doesn’t, the contract ends and you don’t get your payment back."],
  ["Is this insurance?", "No. It can help you prepare for a loss, but Pulse is a prediction market and these are event contracts. You don’t need to prove a loss, and the protections that come with a regulated insurance policy don’t apply."],
  ["Why does the price change?", "The more likely an event looks, the more its cover costs. Time left matters too. The price you see is for the amount you picked."],
  ["Can I cancel?", "Not today. Cover runs until its end time and the price you pay is final."],
  ["Is it live?", "Pulse is a demo. The figures are examples and no real money moves."],
];

export default function LandingPage() {
  const example = covers[0];
  const price = priceFor(example.shield, 500, example.shield.startTs);
  return (
    <>
      <TopNav />
      <main>
        <section className="px-3 pt-3">
          <div className="relative isolate overflow-hidden rounded-[28px] sm:rounded-[36px] text-white">
            <Thermal className="absolute inset-0 -z-10" />
            <div className="mx-auto grid max-w-[1240px] items-center gap-6 px-6 pb-6 pt-12 sm:px-10 sm:pb-14 sm:pt-16 lg:min-h-[660px] lg:grid-cols-[1.1fr_1fr] lg:py-10">
              <div>
                <h1 className="display-1">Cover your crypto before things heat up.</h1>
                <p className="mt-5 max-w-[30rem] text-[17px] sm:text-[19px] leading-relaxed text-white/85">
                  Pick a risk. See your price. If it happens, claim the payout you chose. Cover lasts two to three days.
                </p>
                <div className="mt-7 grid gap-3 sm:mt-9 sm:flex sm:flex-wrap sm:items-center">
                  <Link href="/app" className={EMBER}>Get covered <IconArrowRight size={20} /></Link>
                  <a href="#how" className="press rounded-full border border-white/35 text-center bg-[#0b0f35]/40 px-7 py-4 text-[17px] font-semibold hover:bg-[#0b0f35]/70">How it works</a>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-[400px] lg:max-w-[560px]">
                <Thermal shape="umbrella" className="aspect-square w-full" />
                <div className="-mt-10 w-full lg:absolute lg:bottom-2 lg:left-0 lg:mt-0 lg:w-[290px] rounded-[26px] bg-white p-2 text-indigo-ink shadow-[var(--shadow-xl-2)]">
                  <div className="px-4 pb-3 pt-3">
                    <p className="text-sm text-muted-ink">Example cover</p>
                    <p className="text-[18px] font-semibold">{example.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="rounded-[18px] bg-canvas p-3">You pay<b className="tabular mt-1 block text-xl">{formatUsd(price, 0)}</b></p>
                    <p className="rounded-[18px] bg-seafoam-50 p-3 text-seafoam-700">You could get<b className="tabular mt-1 block text-xl">$500</b></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="covers" className="mx-auto max-w-[1240px] px-5 pt-16 sm:pt-24">
          <h2 className="display-2 max-w-[16ch]">What do you want covered?</h2>
          <div className="mt-7 grid gap-4 sm:mt-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {covers.map((c) => (
              <Link key={c.id} href={`/app?cover=${c.id}`} className="panel press group flex flex-col p-3 hover:border-indigo-navy/40">
                <span className="relative isolate block overflow-hidden rounded-[17px] bg-[#e4e7f5]">
                  <Thermal shape={c.shape} className="mx-auto aspect-[16/10] w-full sm:aspect-[4/3] transition-transform duration-300 ease-out group-hover:scale-105" />
                </span>
                <span className="flex grow flex-col p-4">
                  <span className="font-[family-name:var(--font-display)] text-[26px] font-semibold tracking-[-0.03em]">{c.name}</span>
                  <span className="mt-2 text-[16px] leading-relaxed text-muted-ink">{c.short}</span>
                  <span className="mt-auto block pt-7"><HeatGauge probability={c.shield.probability} /></span>
                  <span className="mt-6 flex items-center justify-between border-t border-silver-lining pt-5 text-[16px]">
                    <span><b className="tabular">{formatUsd(priceFor(c.shield, 100, c.shield.startTs), 0)}</b> for a $100 payout</span>
                    <IconArrowRight size={20} className="text-signal-orange transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted-ink">Example prices. A hotter gauge means the event looks more likely, so cover costs more.</p>
        </section>

        <section id="how" className="mx-auto max-w-[1240px] px-5 pt-20 sm:pt-28">
          <h2 className="display-2">Three steps. No paperwork.</h2>
          <ol className="mt-8 grid gap-x-10 gap-y-4 sm:mt-12 md:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="panel grid grid-cols-[48px_1fr] items-start gap-x-4 p-5 md:block md:rounded-none md:border-0 md:bg-transparent md:p-0">
                <span aria-hidden className="tabular inline-grid h-12 w-12 place-items-center rounded-full bg-indigo-navy text-lg font-semibold text-white">{i + 1}</span>
                <div className="md:mt-6">
                  <h3 className="text-[21px] font-semibold leading-snug md:text-[25px]">{title}</h3>
                  <p className="mt-1.5 max-w-[40ch] text-[16px] leading-relaxed text-muted-ink md:mt-2 md:text-[17px]">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="earn" className="mx-auto max-w-[1240px] px-5 pt-20 sm:pt-28">
          <div className="relative grid items-center overflow-hidden rounded-[28px] sm:rounded-[36px] bg-indigo-navy text-white md:grid-cols-2">
            <div className="p-7 sm:p-14">
              <h2 className="display-2">Be the other side of the cover.</h2>
              <p className="mt-5 max-w-[42ch] text-[18px] leading-relaxed text-white/80">
                Add funds to the pool that pays claims. You earn a share of what people pay for cover. When a claim pays out, the pool loses money and so can you.
              </p>
              <Link href="/app?tab=earn" className="press mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[17px] font-semibold text-indigo-ink hover:bg-canvas">
                See how earning works <IconArrowRight size={20} />
              </Link>
            </div>
            <Thermal shape="lifebuoy" className="mx-auto -mt-6 aspect-square w-full max-w-[300px] pb-6 md:mt-0 md:max-w-[440px] md:pb-0" />
          </div>
        </section>

        <section id="questions" className="mx-auto grid max-w-[1240px] gap-5 px-5 pt-20 sm:pt-28 lg:gap-10 lg:grid-cols-[1fr_1.7fr]">
          <h2 className="display-2">Good questions</h2>
          <div>
            {FAQ.map(([q, a]) => (
              <details key={q} className="group border-b border-silver-lining">
                <summary className="flex list-none items-center justify-between gap-6 py-5 text-[18px] sm:py-6 sm:text-[20px] font-semibold">
                  {q}<IconPlus size={22} className="shrink-0 transition-transform duration-200 group-open:rotate-45" />
                </summary>
                <p className="max-w-[60ch] pb-7 text-[17px] leading-relaxed text-muted-ink">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-3 pt-20 sm:pt-28">
          <div className="relative isolate overflow-hidden rounded-[28px] sm:rounded-[36px] px-6 pb-28 pt-14 text-white sm:px-14 sm:py-28">
            <Thermal className="absolute inset-0 -z-10" />
            <h2 className="display-1 max-w-[11ch]">Sleep through the dip.</h2>
            <Link href="/app" className="press mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-4 text-[17px] font-semibold text-indigo-ink hover:bg-canvas">Get covered <IconArrowRight size={20} /></Link>
          </div>
        </section>
      </main>
      <footer className="mx-auto grid max-w-[1240px] gap-5 px-5 py-12 text-sm leading-relaxed text-muted-ink md:grid-cols-[1fr_2fr]">
        <span className="text-indigo-ink"><Logo /></span>
        <p className="md:text-right">Pulse is a demo on a test network. Covers are prediction market event contracts, not insurance policies. You can lose what you pay.</p>
      </footer>
    </>
  );
}
