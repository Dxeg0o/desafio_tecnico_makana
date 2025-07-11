export interface DescribePayload {
  headers: string[];
  sampleRows: string[][];
}

export async function describeColumns(payload: DescribePayload): Promise<Record<string, string>> {
  const res = await fetch("/api/describe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error("Failed to describe columns");
  }
  return (await res.json()) as Record<string, string>;
}
