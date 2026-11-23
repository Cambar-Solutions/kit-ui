import { cn } from "@/lib/utils";

export type TimelineState = "done" | "current" | "upcoming" | "blocked";

export interface TimelineStep {
  id: string;
  label: string;
  description?: string;
  /** Already formatted for the user, e.g. "12 mar, 10:30". */
  time?: string;
  state: TimelineState;
}

const STATE_TEXT: Record<TimelineState, string> = {
  done: "Completado",
  current: "En curso",
  upcoming: "Pendiente",
  blocked: "Detenido",
};

/** Vertical progress of a process (order status, onboarding). State is also written as text for screen readers. */
export function Timeline({ steps, label }: { steps: TimelineStep[]; label: string }) {
  return (
    <ol aria-label={label} className="flex flex-col">
      {steps.map((step, i) => (
        <li key={step.id} className="relative flex gap-3 pb-6 last:pb-0" aria-current={step.state === "current" ? "step" : undefined}>
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className={cn("absolute start-[11px] top-6 bottom-0 w-px", step.state === "done" ? "bg-primary" : "bg-border")}
            />
          )}
          <span
            aria-hidden
            className={cn(
              "z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold",
              step.state === "done" && "border-primary bg-primary text-primary-foreground",
              step.state === "current" && "border-primary bg-card text-primary",
              step.state === "upcoming" && "border-border bg-card text-muted-foreground",
              step.state === "blocked" && "border-warning bg-card text-warning",
            )}
          >
            {step.state === "done" ? "✓" : i + 1}
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className={cn("text-sm font-medium", step.state === "upcoming" && "text-muted-foreground")}>
              {step.label}
              <span className="sr-only">. {STATE_TEXT[step.state]}</span>
            </p>
            {step.description && <p className="text-sm text-muted-foreground">{step.description}</p>}
            {step.time && <p className="text-xs text-muted-foreground tabular-nums">{step.time}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
