import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex flex-col gap-1 rounded-lg border p-4 text-sm", {
  variants: {
    tone: {
      info: "border-primary/30 bg-primary/8",
      success: "border-success/30 bg-success/10",
      warning: "border-warning/40 bg-warning/10",
      danger: "border-destructive/30 bg-destructive/8",
    },
  },
  defaultVariants: { tone: "info" },
});

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title">, VariantProps<typeof alertVariants> {
  title: string;
  /** Optional action, e.g. a Button. */
  action?: ReactNode;
}

/** Inline message that stays in the page flow. `danger` and `warning` use role=alert, the rest role=status. */
export function Alert({ className, tone, title, action, children, ...props }: AlertProps) {
  const urgent = tone === "danger" || tone === "warning";
  return (
    <div role={urgent ? "alert" : "status"} className={cn(alertVariants({ tone }), className)} {...props}>
      <p className="font-semibold">{title}</p>
      {children && <div className="text-muted-foreground">{children}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
