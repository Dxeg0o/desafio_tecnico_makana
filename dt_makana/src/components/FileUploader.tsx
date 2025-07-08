// src/components/FileUploader.tsx

"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { parseFile } from "../services/fileParser";
import { buildStructureDetectionPrompt } from "../services/aiHelpers";

export interface FileUploaderProps {
  /**
   * Callback invoked with parsed sheets after successful parse
   * Keys are sheet names, values are arrays of row objects
   */
  onDataLoaded?: (data: Record<string, Record<string, unknown>[]>) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const [previewSheets, setPreviewSheets] = useState<
    Record<string, Record<string, unknown>[]>
  >();
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [structure, setStructure] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectStructure = async (rows: Record<string, unknown>[]) => {
    setError(null);
    setStructure(null);
    try {
      const fragment = rows
        .slice(0, 10)
        .map((r) => Object.values(r).slice(0, 10));
      const prompt = buildStructureDetectionPrompt(fragment);
      const res = await fetch("/api/openai", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      });
      const text = await res.text();
      setStructure(JSON.parse(text));
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError('Unknown error');
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log("FileUploader: files dropped:", acceptedFiles);
      const file = acceptedFiles[0];
      if (!file) return;
      try {
        const sheets = await parseFile(file);
        console.log("FileUploader: parsed sheets:", sheets);
        const sheetNames = Object.keys(sheets);
        if (sheetNames.length <= 1) {
          await detectStructure(sheets[sheetNames[0]] || []);
          onDataLoaded?.(sheets);
        } else {
          setPreviewSheets(sheets);
          setSelectedSheets(sheetNames);
        }
      } catch (error: unknown) {
        console.error("FileUploader: error parsing file:", error);
        setError("Ocurrió un error al procesar el archivo.");
      }
    },
    [onDataLoaded]
  );

  const onDropRejected = useCallback((fileRejections: unknown[]) => {
    console.warn("FileUploader: file rejected:", fileRejections);
    alert("El tipo de archivo no es válido. Aceptamos CSV, XLSX y XLSM.");
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    multiple: false,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
        ".xlsm",
      ],
    },
  });

  const toggleSheet = (sheet: string) => {
    setSelectedSheets((prev) =>
      prev.includes(sheet)
        ? prev.filter((s) => s !== sheet)
        : [...prev, sheet]
    );
  };

  const handleConfirm = async () => {
    if (!previewSheets) return;
    const out: Record<string, Record<string, unknown>[]> = {};
    selectedSheets.forEach((name) => {
      const data = previewSheets[name];
      if (data) out[name] = data;
    });
    const firstSheet = out[selectedSheets[0]] || [];
    await detectStructure(firstSheet);
    onDataLoaded?.(out);
    setPreviewSheets(undefined);
    setSelectedSheets([]);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        style={{ minHeight: 150, cursor: "pointer" }}
        className="border-2 border-dashed p-6 text-center rounded-lg hover:border-primary transition"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Suelta el archivo aquí...</p>
        ) : (
          <p>Arrastra un archivo CSV/XLSX/XLSM o haz click para seleccionar</p>
        )}
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {structure && (
        <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
          {JSON.stringify(structure, null, 2)}
        </pre>
      )}

      {previewSheets && Object.keys(previewSheets).length > 1 && (
        <div className="space-y-2">
          <p className="font-semibold">
            El archivo contiene varias hojas. Selecciona las que deseas procesar:
          </p>
          {Object.entries(previewSheets).map(([name, rows]) => {
            const headers = rows[0] ? Object.keys(rows[0]).slice(0, 5) : [];
            return (
              <div key={name} className="border p-2 rounded">
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedSheets.includes(name)}
                    onChange={() => toggleSheet(name)}
                  />
                  <span className="font-medium">{name}</span>
                </label>
                {rows.length > 0 && (
                  <div className="overflow-auto">
                    <table className="text-xs border-collapse">
                      <thead>
                        <tr>
                          {headers.map((h) => (
                            <th key={h} className="border px-1 py-0.5">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(0, 3).map((row, i) => (
                          <tr key={i}>
                            {headers.map((h) => (
                              <td key={h} className="border px-1 py-0.5">
                                {String(row[h] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          <button
            onClick={handleConfirm}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Procesar hojas seleccionadas
          </button>
        </div>
      )}
    </div>
  );
};
