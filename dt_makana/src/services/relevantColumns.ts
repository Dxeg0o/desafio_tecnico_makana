export interface RelevancePayload {
  headers: string[];
  descriptions: Record<string, string>;
  mapping: Record<string, string>;
}

export interface RelevanceResult {
  relevant: string[];
  irrelevant: string[];
}

export async function getRelevantColumns(
  payload: RelevancePayload
): Promise<RelevanceResult> {
  const res = await fetch("/api/relevant-columns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to evaluate column relevance");
  }
  return (await res.json()) as RelevanceResult;
}
