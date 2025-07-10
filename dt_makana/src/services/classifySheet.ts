import { PersonnelEvent } from "@/types";
import { chunkArray } from "@/utils/chunkArray";

export interface ClassifyPayload {
  headers: string[];
  sampleRows: string[][];
  types: ("license" | "accident" | "failure")[];
  rows: Record<string, unknown>[];
}

export async function classifySheet(
  payload: ClassifyPayload
): Promise<PersonnelEvent[]> {
  const BATCH_SIZE = 50;
  const chunks = chunkArray(payload.rows, BATCH_SIZE);
  const all: PersonnelEvent[] = [];

  for (const rows of chunks) {
    const res = await fetch("/api/classify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, rows }),
    });
    if (!res.ok) {
      throw new Error("Failed to classify data");
    }
    const events = (await res.json()) as PersonnelEvent[];
    all.push(...events);
  }

  return all;
}
