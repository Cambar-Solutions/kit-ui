import { useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface FieldTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  helper?: string;
  error?: string;
  id?: string;
}

/** Multi-line input with the same label, helper and error wiring as Field. */
export function FieldTextarea({ label, helper, error, id, className, required, rows = 4, ...props }: FieldTextareaProps) {
  const auto = useId();
  const areaId = id ?? auto;
  const helperId = `${areaId}-helper`;
  const errorId = `${areaId}-error`;
  const describedBy = [error ? errorId : null, helper ? helperId : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={areaId} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-destructive">
            *
          </span>
        )}
      </label>
      <textarea
        id={areaId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cn(
          "w-full rounded-md border border-input bg-card px-3 py-2 text-sm",
          "placeholder:text-muted-foreground",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-destructive",
          className,
        )}
        {...props}
      />
      {helper && (
        <p id={helperId} className="text-sm text-muted-foreground">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
