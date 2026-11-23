import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/kit/card";

/** Base placeholder block. Decorative, so hidden from assistive tech. Shimmer stops under reduced motion. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-md bg-muted motion-safe:bg-[linear-gradient(90deg,var(--muted)_30%,var(--secondary)_50%,var(--muted)_70%)]",
        "motion-safe:bg-[length:200%_100%] motion-safe:animate-[kit-shimmer_1.6s_linear_infinite]",
        className,
      )}
      {...props}
    />
  );
}

/** Matches the shape of Card + CardHeader + CardContent so the layout does not jump when data arrives. */
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </CardContent>
    </Card>
  );
}

/** Announces loading once to screen readers instead of every block. */
export function ListSkeleton({ rows = 3, label = "Cargando" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
