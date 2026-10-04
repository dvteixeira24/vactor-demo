import { cn } from "@/lib/utils";

const base =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none transition-colors placeholder:text-faint focus:border-accent";

export function TextField({
  label,
  hint,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <input className={cn(base, className)} {...props} />
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  hint,
  className,
  rows = 4,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <textarea
        rows={rows}
        className={cn(
          "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-ink outline-none transition-colors placeholder:text-faint focus:border-accent",
          className,
        )}
        {...props}
      />
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </label>
  );
}
