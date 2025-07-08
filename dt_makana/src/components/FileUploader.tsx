// src/components/FileUploader.tsx

"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { parseFile } from "../services/fileParser";

export interface FileUploaderProps {
  /**
   * Callback invoked with parsed sheets after successful parse
   * Keys are sheet names, values are arrays of row objects
   */
  onDataLoaded?: (data: Record<string, Record<string, unknown>[]>) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      console.log("FileUploader: files dropped:", acceptedFiles);
      const file = acceptedFiles[0];
      if (!file) return;
      try {
        const sheets = await parseFile(file);
        console.log("FileUploader: parsed sheets:", sheets);
        onDataLoaded?.(sheets);
      } catch (error) {
        console.error("FileUploader: error parsing file:", error);
        alert("Ocurrió un error al procesar el archivo.");
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
