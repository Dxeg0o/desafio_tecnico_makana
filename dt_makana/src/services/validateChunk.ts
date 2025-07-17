export interface ValidateChunkPayload {
  rows: Record<string, unknown>[];
}

export async function validateChunk(
  payload: ValidateChunkPayload,
): Promise<boolean> {
  const res = await fetch("/api/validate-chunk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to validate chunk");
  }
  const data = (await res.json()) as { valid: boolean };
  return data.valid;
}
