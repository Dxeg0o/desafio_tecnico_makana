import { slugify } from "./normalizeHeaders";

export function filterRelevantColumns(
  rows: Record<string, unknown>[],
  headers: string[],
): Record<string, unknown>[] {
  const allowed = new Set(headers.map((h) => slugify(String(h))));
  console.log("Filtering with headers:", Array.from(allowed));
  console.log("Before filtering keys:", Object.keys(rows[0] || {}));
  const result = rows.map((row) => {
    const filtered: Record<string, unknown> = {};
    for (const key of Object.keys(row)) {
      if (allowed.has(key)) {
        filtered[key] = row[key];
      }
    }
    return filtered;
  });
  console.log("After filtering keys:", Object.keys(result[0] || {}));
  return result;
}
