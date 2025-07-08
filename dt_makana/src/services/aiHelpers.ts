/** Convierte un array de arrays a tabla Markdown */
export function arrayToMarkdownTable(data: unknown[][]): string {
  if (!data.length) return '';
  const header = data[0].map(() => '---').join(' | ');
  const rows = data.map(r => r.join(' | '));
  return [`| ${rows[0]} |`, `| ${header} |`, ...rows.slice(1).map(r => `| ${r} |`)].join('\n');
}

/** Genera prompt para detectar estructura de headers */
export function buildStructureDetectionPrompt(fragment: unknown[][]): string {
  const table = arrayToMarkdownTable(fragment);
  return `You are a data structure assistant. The following is a table extract from an uploaded file:\n\n${table}\n\n1. Determine if headers are horizontal (first row), vertical (first column), or absent.\n2. Specify the zero-based index of the header row or column where the real data begins.\n3. Provide a mapping from detected header names to standard field names: start_date, end_date, event_type, etc.\n\nRespond in JSON:{\n  "orientation": "horizontal|vertical|none",\n  "headerIndex": number,\n  "mapping": { "detectedName": "standardField" }\n}`;
}
