"use client";
import * as React from "react";
import { mountThermal, type ThermalShape } from "@/lib/thermalGl";
import { cn } from "@/lib/utils";

/** Decorative. `shape` renders a 3D object; without it, a moving heat field. */
export function Thermal({ shape, className }: { shape?: ThermalShape; className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => (ref.current ? mountThermal(ref.current, shape ?? null) : undefined), [shape]);
  return (
    <span aria-hidden className={cn("block pointer-events-none", shape ? "thermal-object" : "thermal-field", className)}>
      <canvas ref={ref} className="block h-full w-full" />
    </span>
  );
}
