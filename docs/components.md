# kit-ui components

Each component installs into `components/kit/` of your project, so it never collides with shadcn's `components/ui/`. Colors, type and radius come from your theme (shadcn variables: `primary`, `card`, `muted`, `border`, `input`, `ring`, `destructive`...). `kit-tokens` adds the few variables a shadcn theme does not have and is installed automatically.

## Requirements

A React + Tailwind v4 project with `components.json`. If there is none:

```bash
npx shadcn@latest init            # existing project
npx shadcn@latest init -t vite    # new Vite project
```

## Install

```bash
npx shadcn@latest add Cambar-Solutions/kit-ui/<item>
npx shadcn@latest add Cambar-Solutions/kit-ui/all     # everything
npx shadcn@latest list Cambar-Solutions/kit-ui        # what exists
```

Pin a version for reproducible installs: `Cambar-Solutions/kit-ui/button#<tag-or-commit>`.

Tell an agent: *"usa el Button de kit-ui"*. With the `demo-pwa` skill installed it runs the command for you; without it, give it the command above.

## Catalog

| Item | Import | Use for |
|---|---|---|
| `button` | `Button`, `buttonVariants` from `@/components/kit/button` | Any action. `variant`: default, secondary, outline, ghost, destructive. `size`: sm, md, lg. `loading` shows a spinner, blocks clicks and sets `aria-busy`. |
| `field` | `Field` from `@/components/kit/field` | Text inputs. Required `label`; `helper` and `error` render below and are wired with `aria-describedby` / `aria-invalid`. |
| `field-select` | `FieldSelect` from `@/components/kit/select` | Choosing from a list. Native select, same wiring as `Field`. |
| `field-textarea` | `FieldTextarea` from `@/components/kit/textarea` | Multi-line text, same wiring as `Field`. |
| `card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Grouping with real hierarchy. |
| `skeleton` | `Skeleton`, `CardSkeleton`, `ListSkeleton` | Loading shaped like the final content. Shimmer stops under reduced motion. |
| `empty-state` | `EmptyState` | Empty and error states. `tone="error"` uses `role="alert"`. Always give an action. |
| `badge` | `Badge` | Status. `tone`: neutral, info, success, warning, danger. Always text. |
| `chips` | `Chips` | Single-choice quick filters with `aria-pressed`. Keep the value in the URL. |
| `alert` | `Alert` | Inline feedback with optional `action`. Urgent tones use `role="alert"`. |
| `stat` | `Stat` | One number with label inside a `<dl>`. |
| `timeline` | `Timeline` | Order status, onboarding. Steps `done`, `current`, `upcoming`, `blocked`. |
| `confirm-dialog` | `ConfirmDialog` | Destructive or irreversible actions. Native `<dialog>`. Name the target. |
| `list-view` | `ListView`, `ViewStatus` | Lists with loading, empty, error and ready. Optional `selectedId` / `onSelect`. |
| `table-view` | `TableView`, `Column` | Tables with the four states. Columns hide by container width (`hideBelow`), `nowrap` for folios and amounts. |
| `kit-tokens` | (CSS) | `--success`, `--warning`, `--destructive-foreground`, `--control-h`, `--motion`, `--space-section`, `kit-shimmer`. Edit them in your CSS. |
| `demo-pwa` | (skill) | Installs the demo-pwa agent skill into `.kiro/skills/demo-pwa`. |

## Examples

```tsx
import { Button } from "@/components/kit/button";
import { Field } from "@/components/kit/field";
import { Badge } from "@/components/kit/badge";
import { ConfirmDialog } from "@/components/kit/confirm-dialog";

<Field label="Correo" type="email" helper="Usa tu correo de trabajo." error={error} />
<Button loading={saving} onClick={save}>Guardar cambios</Button>
<Badge tone="warning">Por aprobar</Badge>
<ConfirmDialog
  open={open}
  title="¿Cancelar la orden?"
  description="Se cancelará F-2481 de Carlos Mendoza."
  confirmLabel="Sí, cancelar"
  destructive
  onCancel={() => setOpen(false)}
  onConfirm={cancelOrder}
/>
```

```tsx
import { TableView, type Column } from "@/components/kit/table-view";

const columns: Column<Order>[] = [
  { key: "folio", header: "Folio", nowrap: true, cell: (o) => o.folio },
  { key: "cliente", header: "Cliente", cell: (o) => o.customerName },
  { key: "moto", header: "Moto", hideBelow: "md", cell: (o) => o.vehicle },
  { key: "total", header: "Total", align: "end", nowrap: true, cell: (o) => money(o.total) },
];

<TableView
  title="Órdenes"
  status={status}            // "loading" | "empty" | "error" | "ready"
  rows={orders}
  columns={columns}
  getRowId={(o) => o.id}
  selectedId={selected}
  onSelect={setSelected}
  emptyTitle="Todavía no hay órdenes"
  emptyDescription="Crea la primera cuando llegue una moto."
  errorDescription="Revisa la conexión e inténtalo de nuevo."
  onRetry={refetch}
/>
```

## Matching a custom design

If the project's design comes from `impeccable` (`DESIGN.md`) or another system, map its tokens to the shadcn variables in your CSS (`--primary`, `--primary-foreground`, `--card`, `--muted`, `--muted-foreground`, `--border`, `--input`, `--ring`, `--destructive`, `--radius`) and set `kit-tokens` (`--success`, `--warning`, `--control-h`). The components follow automatically. Do not edit colors inside the component files.

## Contributing a component

1. Add the file to `registry/kit/`. Use theme tokens only, `cva` for variants, `cn` from `@/lib/utils`, and import other kit components from `@/components/kit/<file>`.
2. Cover every state that applies: hover, focus-visible, active, disabled, loading, error.
3. Add an item to `registry.json` with `target: "@components/kit/<file>"`, `registryDependencies` (`utils`, `Cambar-Solutions/kit-ui/kit-tokens`, other kit items by full address) and npm `dependencies`.
4. `npx shadcn@latest registry validate` and install it in a test project before merging.
5. Add it to this table and to `all`.
