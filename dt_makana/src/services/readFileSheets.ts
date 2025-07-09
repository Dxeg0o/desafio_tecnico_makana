import Papa from "papaparse";
import * as XLSX from "xlsx";

export async function readFileSheets(
  file: File
): Promise<Record<string, string[][]>> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") {
    const rows = await parseCSV(file);
    return { Sheet1: rows };
  } else if (["xlsx", "xls", "xlsm"].includes(ext ?? "")) {
    return parseExcel(file);
  } else {
    throw new Error(`Unsupported file type: .${ext}`);
  }
}

function parseCSV(file: File): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as unknown as string[][]),
      error: (error) => reject(error),
    });
  });
}

async function parseExcel(
  file: File
): Promise<Record<string, string[][]>> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const result: Record<string, string[][]> = {};
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rows: string[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
      blankrows: false,
    }) as unknown as string[][];
    result[sheetName] = rows;
  });
  return result;
}
