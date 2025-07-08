// src/services/fileParser.ts

import Papa from "papaparse";
import * as XLSX from "xlsx";
import { normalizeHeaders } from "../utils/normalizeHeaders";

/**
 * Detects file type and parses CSV or Excel files (XLSX/XLS/XLSM) accordingly.
 * Returns an object where keys are sheet names (or 'Sheet1' for CSV)
 * and values are arrays of row objects with normalized headers.
 * @param file File object selected by the user
 */
export async function parseFile(
  file: File
): Promise<Record<string, Record<string, unknown>[]>> {
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

/**
 * Parses a CSV file using PapaParse, normalizing headers.
 */
function parseCSV(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => normalizeHeader(header),
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
    });
  });
}

/**
 * Parses all sheets of an Excel file (XLSX/XLS/XLSM) using SheetJS,
 * normalizing headers per sheet, and returns a map of sheetName -> rows.
 */
async function parseExcel(
  file: File
): Promise<Record<string, Record<string, unknown>[]>> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const result: Record<string, Record<string, unknown>[]> = {};

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const sheetData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      {
        defval: "",
      }
    );
    if (sheetData.length === 0) {
      result[sheetName] = [];
      return;
    }
    const originalHeaders = Object.keys(sheetData[0]);
    const normalizedHeaders = normalizeHeaders(originalHeaders);
    const parsedRows = sheetData.map((row) => {
      const out: Record<string, unknown> = {};
      originalHeaders.forEach((h, i) => {
        out[normalizedHeaders[i]] = row[h];
      });
      return out;
    });
    result[sheetName] = parsedRows;
  });

  return result;
}

/**
 * Normalizes a single header string based on headerMap or fallback to slugify.
 */
function normalizeHeader(header: string): string {
  return normalizeHeaders([header])[0];
}
