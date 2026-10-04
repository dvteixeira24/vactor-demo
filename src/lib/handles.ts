/**
 * Turns a display name into a URL-safe handle. Deterministic and pure so it
 * can be unit-tested; callers resolve collisions with `uniqueHandle`.
 */
export function slugifyHandle(input: string): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/g, "");
  return slug || "actor";
}

/** Returns `base`, or `base-2`, `base-3`, … — the first that is not taken. */
export function uniqueHandle(base: string, taken: Iterable<string>): string {
  const set = taken instanceof Set ? taken : new Set(taken);
  if (!set.has(base)) return base;
  let n = 2;
  while (set.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
