import Link from "next/link";
import { CATEGORIES } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export function CategoryChips({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip href="/" label="All" active={!active} />
      {CATEGORIES.map((category) => (
        <Chip
          key={category}
          href={`/?category=${encodeURIComponent(category)}`}
          label={category}
          active={active === category}
        />
      ))}
    </div>
  );
}

function Chip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-ink bg-ink text-white"
          : "border-line-strong bg-surface text-ink-soft hover:border-accent-ring hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}
