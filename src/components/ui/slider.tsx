"use client";
import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, "aria-labelledby": labelledBy, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn("relative flex w-full touch-none select-none items-center h-6", className)}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[6px] w-full grow overflow-hidden rounded-full bg-indigo-navy/10">
      <SliderPrimitive.Range className="absolute h-full bg-signal-orange" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      aria-labelledby={labelledBy}
      className="block h-6 w-6 rounded-full border-2 border-signal-orange bg-white shadow-[0_2px_6px_rgba(16,24,40,0.15)] transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-navy/30"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;
