/**
 * Converts a header string to snake_case alphanumeric
 */
export function slugify(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Normalize an array of header strings by converting each one to
 * a snake_case alphanumeric value.
 */
export function normalizeHeaders(headers: string[]): string[] {
  return headers.map((h) => slugify(String(h)));
}
