import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 h-6 text-[11px] font-medium tracking-[0.02em] uppercase",
  {
    variants: {
      variant: {
        neutral: "bg-white border-silver-lining text-indigo-ink",
        seafoam: "bg-seafoam-50 border-seafoam-500/40 text-seafoam-700",
        orange: "bg-signal-orange-soft border-signal-orange/40 text-signal-orange",
        navy: "bg-indigo-navy text-white border-indigo-navy",
        danger: "bg-red-50 border-danger/40 text-danger",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
