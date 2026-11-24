import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[8px] border border-silver-lining bg-white px-3 py-2 text-sm text-indigo-ink",
        "placeholder:text-muted-ink",
        "focus-visible:outline-none focus-visible:border-indigo-navy focus-visible:ring-2 focus-visible:ring-indigo-navy/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
