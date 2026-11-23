import type { ReactNode } from "react";
import { Button } from "@/components/kit/button";
import { EmptyState } from "@/components/kit/empty-state";
import { Skeleton } from "@/components/kit/skeleton";
import { cn } from "@/lib/utils";
import type { ViewStatus } from "@/components/kit/list-view";

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Hide this column below the given breakpoint to keep the table readable on small screens. */
  hideBelow?: "md" | "lg" | "xl";
  align?: "start" | "end";
  /** Keep the value on one line (folios, amounts, dates). */
  nowrap?: boolean;
}

export interface TableViewProps<T> {
  title: string;
  status: ViewStatus;
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  selectedId?: string;
  onSelect?: (id: string) => void;
  /** Filters, search, bulk actions. Rendered above the table. */
  toolbar?: ReactNode;
  primaryAction?: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  errorDescription: string;
  onRetry: () => void;
}

// Columns hide by the width of the TABLE area (container queries), not the window: a docked detail panel takes space too.
const HIDE = { md: "hidden @lg:table-cell", lg: "hidden @3xl:table-cell", xl: "hidden @5xl:table-cell" } as const;

/**
 * Template: data table with the four states resolved.
 * The first column is the row's main label and stays visible on every screen size.
 */
export function TableView<T>({
  title,
  status,
  rows,
  columns,
  getRowId,
  selectedId,
  onSelect,
  toolbar,
  primaryAction,
  emptyTitle,
  emptyDescription,
  errorDescription,
  onRetry,
}: TableViewProps<T>) {
  return (
    <section aria-labelledby="table-title" className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-4">
        <h2 id="table-title" className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {primaryAction}
      </header>
      {toolbar}

      {status === "loading" && (
        <div role="status" aria-live="polite" className="flex flex-col gap-2">
          <span className="sr-only">Cargando</span>
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-11 w-full" />
          ))}
        </div>
      )}

      {status === "empty" && <EmptyState title={emptyTitle} description={emptyDescription} action={primaryAction} />}

      {status === "error" && (
        <EmptyState
          tone="error"
          title="No pudimos cargar los datos"
          description={errorDescription}
          action={<Button variant="outline" onClick={onRetry}>Reintentar</Button>}
        />
      )}

      {status === "ready" && (
        <div className="@container"><div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-start text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={cn(
                      "px-4 py-3 font-medium",
                      c.align === "end" ? "text-end" : "text-start",
                      c.hideBelow && HIDE[c.hideBelow],
                    )}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => {
                const id = getRowId(row);
                const selected = id === selectedId;
                return (
                  <tr
                    key={id}
                    aria-selected={onSelect ? selected : undefined}
                    className={cn(selected && "bg-secondary", onSelect && "cursor-pointer hover:bg-muted/60")}
                    onClick={onSelect ? () => onSelect(id) : undefined}
                  >
                    {columns.map((c, i) => (
                      <td
                        key={c.key}
                        className={cn("px-4 py-3", c.align === "end" && "text-end", c.nowrap && "whitespace-nowrap", c.hideBelow && HIDE[c.hideBelow])}
                      >
                        {onSelect && i === 0 ? (
                          <button
                            type="button"
                            className="text-start font-medium underline-offset-4 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelect(id);
                            }}
                          >
                            {c.cell(row)}
                          </button>
                        ) : (
                          c.cell(row)
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div></div>
      )}
    </section>
  );
}
