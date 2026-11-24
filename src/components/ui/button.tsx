"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-navy/30 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-indigo-navy text-white hover:bg-[#262b63] shadow-[0_1px_2px_rgba(16,24,40,0.08)]",
        secondary:
          "bg-transparent border border-indigo-navy text-indigo-navy hover:bg-indigo-navy/5",
        ghost:
          "bg-transparent text-indigo-ink hover:bg-silver-lining/60",
        orange:
          "bg-signal-orange text-white hover:bg-[#b92f0c]",
        danger:
          "bg-danger text-white hover:bg-[#b83a3a]",
        link:
          "bg-transparent text-indigo-navy underline-offset-4 hover:underline h-auto p-0",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
