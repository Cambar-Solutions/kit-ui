import { useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  /** Required. A placeholder is never a label. */
  label: string;
  /** Always rendered below the label when provided. */
  helper?: string;
  /** Error text shown below the input. Sets aria-invalid. */
  error?: string;
  id?: string;
}

/**
 * Label above, helper and error below. Wires aria-describedby and aria-invalid.
 * Use this for every text input so forms validate and read the same everywhere.
 */
export function Field({ label, helper, error, id, className, required, ...props }: FieldProps) {
  const auto = useId();
  const inputId = id ?? auto;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;
  const describedBy = [error ? errorId : null, helper ? helperId : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-destructive">
            *
          </span>
        )}
      </label>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cn(
          "h-(--control-h) w-full rounded-md border border-input bg-card px-3 text-sm",
          "placeholder:text-muted-foreground",
          "transition-[border-color,box-shadow] duration-(--motion)",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/40",
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
