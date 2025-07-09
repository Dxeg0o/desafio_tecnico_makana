import { PersonnelEvent } from "@/types";

export interface ClassifyPayload {
  headers: string[];
  sampleRows: string[][];
  rows: Record<string, unknown>[];
}

export async function classifySheet(
  payload: ClassifyPayload
): Promise<PersonnelEvent[]> {
  const res = await fetch("/api/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to classify data");
  }
  return (await res.json()) as PersonnelEvent[];
}
