"use client";
import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";

export default function Home() {
  const [data, setData] = useState<Record<string, Record<string, unknown>[]>>();

  return (
    <div className="p-4 space-y-6">
      <FileUploader onDataLoaded={setData} />
      {data && (
        <div className="space-y-4">
          {Object.entries(data).map(([name, rows]) => (
            <p key={name}>
              <strong>{name}</strong>: {rows.length} filas seleccionadas
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
