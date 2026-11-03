import { cn } from "@/lib/utils";

const STEPS = ["Shipping", "Payment", "Confirmation"] as const;

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="mb-14 flex justify-center">
      {STEPS.map((label, i) => {
        const step = i + 1;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-[30px] w-[30px] items-center justify-center rounded-full border border-border text-xs font-semibold",
                  step <= current && "border-ink bg-ink text-paper"
                )}
              >
                {step}
              </div>
              <span className={cn("text-sm text-stone", step === current && "font-semibold text-ink")}>
                {label}
              </span>
            </div>
            {step < STEPS.length && <div className="mx-3.5 h-px w-14 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}
