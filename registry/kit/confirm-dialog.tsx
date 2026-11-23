import { useEffect, useRef } from "react";
import { Button } from "@/components/kit/button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Name the thing being changed, e.g. "Se eliminará la orden OS-1042." */
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Native <dialog>: focus trap, Esc to close and inert background come from the browser. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-xl border bg-card p-6 text-card-foreground shadow-lg backdrop:bg-foreground/40"
    >
      <h2 id="confirm-title" className="text-base font-semibold">
        {title}
      </h2>
      <p id="confirm-desc" className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
