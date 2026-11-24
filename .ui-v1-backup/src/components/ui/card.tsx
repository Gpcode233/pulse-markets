import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "bg-white rounded-[8px] border border-silver-lining shadow-hairline",
        className,
      )}
      style={{ boxShadow: "var(--shadow-hairline)" }}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardFloating = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-white rounded-[8px] border border-silver-lining", className)}
      style={{ boxShadow: "var(--shadow-xl-2)" }}
      {...props}
    />
  ),
);
CardFloating.displayName = "CardFloating";

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pb-3 flex flex-col gap-1", className)} {...props} />
);
export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-[18px] font-medium tracking-[-0.01em] text-indigo-ink", className)} {...props} />
);
export const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-sm text-muted-ink", className)} {...props} />
);
export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-3", className)} {...props} />
);
export const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-3 flex items-center gap-2", className)} {...props} />
);
