"use client";
import * as React from "react";
import { IconCoins, IconShieldCheck, IconUmbrella } from "@tabler/icons-react";
import { TopNav } from "@/components/TopNav";
import { Earn } from "@/components/app/Earn";
import { GetCover } from "@/components/app/GetCover";
import { MyCover, type Holding } from "@/components/app/MyCover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { covers } from "@/lib/covers";
import { formatUsd } from "@/lib/utils";

const TABS = [
  ["cover", "Get cover", IconUmbrella],
  ["mine", "My cover", IconShieldCheck],
  ["earn", "Earn", IconCoins],
] as const;

const TITLES: Record<string, string> = { cover: "What’s on your mind?", mine: "My cover", earn: "Earn" };

export default function AppPage() {
  // Prices and end times depend on the clock, so they render after mount only.
  const [now, setNow] = React.useState<number | null>(null);
  const [tab, setTab] = React.useState("cover");
  const [selectedId, setSelectedId] = React.useState(covers[0].id);
  const [holdings, setHoldings] = React.useState<Holding[]>([]);
  const { push } = useToast();

  React.useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (covers.some((c) => c.id === q.get("cover"))) setSelectedId(q.get("cover")!);
    if (q.get("tab") === "earn") setTab("earn");
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const setStatus = (id: number, status: Holding["status"]) =>
    setHoldings((hs) => hs.map((h) => (h.id === id ? { ...h, status } : h)));

  return (
    <>
      <TopNav />
      <main className="mx-auto min-h-dvh max-w-[1240px] px-5 pb-32 pt-7 sm:pt-10">
        <Tabs value={tab} onValueChange={setTab}>
          <div className="mb-6 flex sm:mb-8 flex-wrap items-end justify-between gap-5">
            <h1 className="display-2">{TITLES[tab]}</h1>
            <TabsList className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-30 grid grid-cols-3 rounded-full border border-silver-lining bg-white p-1.5 shadow-[var(--shadow-xl-2)] md:static md:inline-grid md:shadow-none">
              {TABS.map(([id, label, Icon]) => (
                <TabsTrigger key={id} value={id} className="h-11 gap-2 rounded-full px-3 text-[14px] font-semibold sm:text-[15px] data-[state=active]:bg-indigo-navy data-[state=active]:text-white sm:px-5">
                  <Icon size={18} stroke={2.2} />{label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {now === null ? (
            <div className="panel h-[480px]" aria-busy="true" aria-label="Loading prices" />
          ) : (
            <>
              <TabsContent value="cover" className="mt-0">
                <GetCover
                  now={now}
                  selected={covers.find((c) => c.id === selectedId)!}
                  onSelect={setSelectedId}
                  onBuy={(cover, payout, price) => setHoldings((hs) => [{ id: Date.now(), cover, payout, price, status: "active" }, ...hs])}
                  onDone={() => setTab("mine")}
                />
              </TabsContent>
              <TabsContent value="mine" className="mt-0">
                <MyCover
                  holdings={holdings}
                  onBrowse={() => setTab("cover")}
                  onSimulate={(id) => { setStatus(id, "ready"); push({ variant: "warn", title: "It happened", description: "Your payout is ready to claim." }); }}
                  onClaim={(id) => { setStatus(id, "paid"); push({ variant: "success", title: "Payout claimed", description: `${formatUsd(holdings.find((h) => h.id === id)?.payout ?? 0, 0)} in demo funds.` }); }}
                />
              </TabsContent>
              <TabsContent value="earn" className="mt-0"><Earn /></TabsContent>
            </>
          )}
        </Tabs>
        <p className="mt-10 text-sm leading-relaxed text-muted-ink">Demo with example figures. Covers are prediction market event contracts, not insurance policies. You can lose what you pay.</p>
      </main>
    </>
  );
}
