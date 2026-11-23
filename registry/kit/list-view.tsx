import type { ReactNode } from "react";
import { Button } from "@/components/kit/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/kit/card";
import { EmptyState } from "@/components/kit/empty-state";
import { ListSkeleton } from "@/components/kit/skeleton";
import { cn } from "@/lib/utils";

export type ViewStatus = "loading" | "empty" | "error" | "ready";

export interface ListItem {
  id: string;
  title: string;
  description: string;
}

export interface ListViewProps {
  title: string;
  status: ViewStatus;
  items: ListItem[];
  /** Header action, e.g. "Nuevo cliente". */
  primaryAction?: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  errorDescription: string;
  onRetry: () => void;
  /** Makes rows selectable (for the inspector). */
  selectedId?: string;
  onSelect?: (id: string) => void;
}

/**
 * Template: list with all four states resolved.
 * Rule: a view never renders only the "ready" case. Every data view maps loading, empty, error and ready.
 */
export function ListView({
  title,
  status,
  items,
  primaryAction,
  emptyTitle,
  emptyDescription,
  errorDescription,
  onRetry,
  selectedId,
  onSelect,
}: ListViewProps) {
  return (
    <section aria-labelledby="list-title" className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-4">
        <h2 id="list-title" className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {primaryAction}
      </header>

      {status === "loading" && <ListSkeleton rows={3} />}

      {status === "empty" && (
        <EmptyState title={emptyTitle} description={emptyDescription} action={primaryAction} />
      )}

      {status === "error" && (
        <EmptyState
          tone="error"
          title="No pudimos cargar los datos"
          description={errorDescription}
          action={<Button variant="outline" onClick={onRetry}>Reintentar</Button>}
        />
      )}

      {status === "ready" && (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const card = (
              <Card className={cn(selectedId === item.id && "ring-2 ring-primary")}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            );
            return (
              <li key={item.id}>
                {onSelect ? (
                  <button
                    type="button"
                    aria-pressed={selectedId === item.id}
                    onClick={() => onSelect(item.id)}
                    className="block w-full rounded-lg text-start"
                  >
                    {card}
                  </button>
                ) : (
                  card
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
