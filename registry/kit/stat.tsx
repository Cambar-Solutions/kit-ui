import type { ReactNode } from "react";

/** One number with its label. Group several inside a single Card instead of one card each. */
export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tabular-nums">{value}</dd>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
