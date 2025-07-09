import { normalizeHeaders } from "./normalizeHeaders";

export interface HeaderConfig {
  orientation: "row" | "column";
  index: number;
}

export function convertSheetData(
  rows: string[][],
  config: HeaderConfig
): Record<string, unknown>[] {
  if (config.orientation === "column") {
    const headersRaw = rows.map((r) => String(r[config.index] ?? ""));
    const headers = normalizeHeaders(headersRaw);
    const colCount = rows[0]?.length ?? 0;
    const result: Record<string, unknown>[] = [];
    for (let col = 0; col < colCount; col++) {
      if (col === config.index) continue;
      const record: Record<string, unknown> = {};
      for (let row = 0; row < headers.length; row++) {
        record[headers[row]] = rows[row]?.[col];
      }
      result.push(record);
    }
    return result;
  }

  const headersRaw = rows[config.index] || [];
  const headers = normalizeHeaders(headersRaw.map((h) => String(h ?? "")));
  const result: Record<string, unknown>[] = [];
  for (let i = config.index + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => c === "")) continue;
    const record: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      record[h] = row[idx];
    });
    result.push(record);
  }
  return result;
}
