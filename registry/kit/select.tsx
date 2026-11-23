import { useId, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface FieldSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: string;
  options: readonly { value: string; label: string }[];
  /** Adds a first disabled option such as "Elige una opción". */
  placeholder?: string;
  helper?: string;
  error?: string;
  id?: string;
}

/**
 * Native select with the same label, helper and error wiring as Field.
 * Native on purpose: zero JS, accessible, and the best picker on phones.
 */
export function FieldSelect({ label, options, placeholder, helper, error, id, className, required, ...props }: FieldSelectProps) {
  const auto = useId();
  const selectId = id ?? auto;
  const helperId = `${selectId}-helper`;
  const errorId = `${selectId}-error`;
  const describedBy = [error ? errorId : null, helper ? helperId : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={selectId} className="text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden className="ml-1 text-destructive">
            *
          </span>
        )}
      </label>
      <select
        id={selectId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={cn(
          "h-(--control-h) w-full rounded-md border border-input bg-card px-3 text-sm",
          "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-destructive",
          className,
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
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
