export interface MapFieldsPayload {
  headers: string[];
  descriptions: Record<string, string>;
  types: ("license" | "accident" | "failure")[];
}

export async function mapFields(payload: MapFieldsPayload): Promise<Record<string, string>> {
  const res = await fetch("/api/map-fields", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to map fields");
  }
  return (await res.json()) as Record<string, string>;
}
