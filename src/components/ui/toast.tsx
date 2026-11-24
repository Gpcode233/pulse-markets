"use client";
import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { IconX, IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export const ToastProvider = ToastPrimitive.Provider;
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-20 right-0 sm:bottom-6 sm:right-6 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:p-0 sm:max-w-[420px]",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

type Variant = "default" | "success" | "warn";

interface ToastItem {
  id: number;
  title: string;
  description?: React.ReactNode;
  variant?: Variant;
  durationMs?: number;
}

const ToastCtx = React.createContext<{ push: (t: Omit<ToastItem, "id">) => void } | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast outside ToastRoot");
  return ctx;
}

export function ToastRoot({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const push = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { id, ...t }]);
  }, []);
  const dismiss = (id: number) => setItems((xs) => xs.filter((x) => x.id !== id));

  return (
    <ToastCtx.Provider value={{ push }}>
      <ToastProvider swipeDirection="right" duration={5000}>
        {children}
        {items.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            onOpenChange={(o) => !o && dismiss(t.id)}
            className={cn(
              "fadein grid grid-cols-[auto_1fr_auto] items-start gap-3 bg-white rounded-[18px] border border-silver-lining p-4 pr-10",
            )}
            style={{ boxShadow: "var(--shadow-xl-2)" }}
          >
            <span
              className={cn(
                "mt-0.5 h-6 w-6 inline-flex items-center justify-center rounded-full",
                t.variant === "success" && "bg-seafoam-50 text-seafoam-700",
                t.variant === "warn" && "bg-signal-orange-soft text-signal-orange",
                (!t.variant || t.variant === "default") && "bg-indigo-navy/5 text-indigo-navy",
              )}
            >
              {t.variant === "success" ? (
                <IconCheck size={14} />
              ) : t.variant === "warn" ? (
                <IconAlertTriangle size={14} />
              ) : (
                <IconCheck size={14} />
              )}
            </span>
            <div className="flex flex-col gap-1">
              <ToastPrimitive.Title className="text-sm font-medium text-indigo-ink">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-xs text-muted-ink leading-relaxed">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="absolute right-3 top-3 rounded-md p-1 text-muted-ink hover:bg-canvas">
              <IconX size={14} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastCtx.Provider>
  );
}
