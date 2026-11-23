import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  /** Say what the user can do to fill this screen. */
  description: string;
  /** Primary action that resolves the empty or error state. */
  action?: ReactNode;
  /** "error" uses role=alert and the destructive color for the title. */
  tone?: "empty" | "error";
  className?: string;
}

export function EmptyState({ title, description, action, tone = "empty", className }: EmptyStateProps) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      <h3 className={cn("text-base font-semibold", tone === "error" && "text-destructive")}>{title}</h3>
      <p className="max-w-[48ch] text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
