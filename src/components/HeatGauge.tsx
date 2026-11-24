import { heatLabel } from "@/lib/covers";

export function HeatGauge({ probability }: { probability: number }) {
  return (
    <span className="block">
      <span className="flex justify-between text-sm">
        <span className="text-muted-ink">Chance it happens</span>
        <span className="font-semibold">{heatLabel(probability)}</span>
      </span>
      <span aria-hidden className="heat-bar relative mt-3 block h-2 rounded-full">
        <span
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[5px] border-indigo-ink bg-white"
          style={{ left: `${Math.min(94, Math.max(6, probability * 100))}%` }}
        />
      </span>
    </span>
  );
}
