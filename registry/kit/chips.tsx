import { Button } from "@/components/kit/button";

export interface ChipsProps<T extends string> {
  /** Accessible name of the group, e.g. "Filtrar por estado". */
  label: string;
  value: T;
  options: readonly (readonly [T, string])[];
  onChange: (value: T) => void;
}

/** Quick filters shown as pills (single choice). The active chip has aria-pressed. */
export function Chips<T extends string>({ label, value, options, onChange }: ChipsProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <Button
          key={v}
          size="sm"
          className="rounded-full"
          variant={value === v ? "default" : "secondary"}
          aria-pressed={value === v}
          onClick={() => onChange(v)}
        >
          {text}
        </Button>
      ))}
    </div>
  );
}
