export interface HeaderConfig {
  orientation: "row" | "column"
  index: number
}

export function convertSheetData(data: string[][], config: HeaderConfig): Record<string, unknown>[] {
  const { orientation, index } = config
  let headers: string[]
  let contentStart: number

  if (orientation === "row") {
    headers = data[index] || []
    contentStart = index + 1
  } else {
    headers = data.map((row) => row[index] || "")
    contentStart = 0
  }

  const results: Record<string, unknown>[] = []

  for (let i = contentStart; i < data.length; i++) {
    const row = data[i]
    if (!row) continue

    const item: Record<string, unknown> = {}

    for (let j = 0; j < headers.length; j++) {
      const header = headers[j]
      let value: string | number | boolean | null = row[j] || ""

      // Ensure we have a string before processing
      const stringValue = String(value).trim()

      // Attempt to convert to number if possible
      if (stringValue !== "" && !isNaN(Number(stringValue))) {
        value = Number(stringValue)
      } else if (stringValue.toLowerCase() === "true") {
        value = true
      } else if (stringValue.toLowerCase() === "false") {
        value = false
      } else if (stringValue === "") {
        value = null
      } else {
        value = stringValue
      }

      item[header] = value
    }

    // Only add non-empty rows
    if (Object.values(item).some((val) => val !== null && val !== "")) {
      results.push(item)
    }
  }

  return results
}
