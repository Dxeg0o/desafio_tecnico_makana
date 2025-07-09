// src/components/FileUploader.tsx

"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { readFileSheets } from "../services/readFileSheets";

export interface FileUploaderProps {
  /**
   * Callback invoked with parsed sheets after successful parse
   * Keys are sheet names and values are arrays of rows
   */
  onFileLoaded?: (data: Record<string, string[][]>) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      try {
        const sheets = await readFileSheets(file);
        onFileLoaded?.(sheets);
      } catch (error) {
        console.error("FileUploader: error parsing file:", error);
        alert("Ocurrió un error al procesar el archivo.");
      }
    },
    [onFileLoaded]
  );

  const onDropRejected = useCallback(() => {
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

  return (
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
  );
};
