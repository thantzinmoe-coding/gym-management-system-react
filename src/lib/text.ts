/**
 * Safe text helpers. People can exist without a profile (for example a trainer who has not
 * finished sign-up), so a name may arrive as null or empty. Rendering code must never call
 * string methods on it directly: one missing name would crash the whole page.
 */

/** Initials for an avatar, e.g. "Jane Doe" -> "JD". "?" when there is no name. */
export function initials(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
}

/** The name to show, or `fallback` when it is missing. */
export function displayName(name?: string | null, fallback = 'No name yet'): string {
  const trimmed = (name ?? '').trim();
  return trimmed || fallback;
}

/** Case-insensitive "contains" that treats a missing value as no match instead of throwing. */
export function matches(value: string | null | undefined, query: string): boolean {
  return (value ?? '').toLowerCase().includes(query.toLowerCase());
}
