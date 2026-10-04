"use client";

import { cn } from "@/lib/utils";

export function ChipToggle({
  options,
  selected,
  onChange,
  label,
  max,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  label: string;
  max?: number;
}) {
  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else if (!max || selected.length < max) {
      onChange([...selected, option]);
    }
  }

  return (
    <fieldset className="flex flex-col gap-2 text-sm">
      <legend className="font-medium text-ink-soft">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(option)}
              className={cn(
                "rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-accent bg-accent-soft text-accent-hover"
                  : "border-line-strong bg-surface text-muted hover:border-accent-ring hover:text-ink",
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
