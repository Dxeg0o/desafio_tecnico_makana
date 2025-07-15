import { PersonnelEvent } from "@/types";

export interface ClassifyPayload {
  rows: Record<string, unknown>[];
  types: ("license" | "accident" | "failure")[];
  descriptions: Record<string, string>;
  mapping: Record<string, string>;
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
