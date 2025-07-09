"use client";
import { useState } from "react";
import { FileUploader } from "@/components/FileUploader";
import { convertSheetData, HeaderConfig } from "@/utils/convertSheetData";
import * as XLSX from "xlsx";

interface SheetConfig extends HeaderConfig {
  type: "license" | "accident" | "failure";
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [sheets, setSheets] = useState<Record<string, string[][]>>();
  const [selected, setSelected] = useState<string[]>([]);
  const [configs, setConfigs] = useState<Record<string, SheetConfig>>({});
  const [structured, setStructured] = useState<
    Record<string, Record<string, unknown>[]>
  >();

  const handleFileLoaded = (data: Record<string, string[][]>) => {
    setSheets(data);
    setSelected(Object.keys(data));
    const cfg: Record<string, SheetConfig> = {};
    Object.keys(data).forEach((name) => {
      cfg[name] = { type: "license", orientation: "row", index: 0 };
    });
    setConfigs(cfg);
    setStep(2);
  };

  const updateConfig = (
    sheet: string,
    partial: Partial<SheetConfig>
  ) => {
    setConfigs((prev) => ({ ...prev, [sheet]: { ...prev[sheet], ...partial } }));
  };

  const toggleSheet = (name: string) => {
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const processData = () => {
    if (!sheets) return;
    const out: Record<string, Record<string, unknown>[]> = {};
    selected.forEach((name) => {
      const rows = sheets[name];
      const cfg = configs[name];
      if (rows && cfg) {
        out[name] = convertSheetData(rows, cfg);
      }
    });
    setStructured(out);
    setStep(4);
  };

  const downloadJSON = () => {
    if (!structured) return;
    const blob = new Blob([JSON.stringify(structured, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadXLSX = () => {
    if (!structured) return;
    const wb = XLSX.utils.book_new();
    Object.entries(structured).forEach(([name, rows]) => {
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, name);
    });
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Procesar archivo</h1>
      {step === 1 && <FileUploader onFileLoaded={handleFileLoaded} />}
      {step === 2 && sheets && (
        <div className="space-y-4">
          <p className="font-semibold">Selecciona las hojas y su tipo de dato</p>
          {Object.entries(sheets).map(([name, rows]) => (
            <div key={name} className="border p-2 rounded">
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={selected.includes(name)}
                  onChange={() => toggleSheet(name)}
                />
                <span className="font-medium">{name}</span>
                <select
                  value={configs[name].type}
                  onChange={(e) =>
                    updateConfig(name, {
                      type: e.target.value as SheetConfig["type"],
                    })
                  }
                  className="ml-2 border px-1 py-0.5"
                >
                  <option value="license">Licencia</option>
                  <option value="accident">Accidentes</option>
                  <option value="failure">Fallas</option>
                </select>
              </label>
              <div className="overflow-auto">
                <table className="text-xs border-collapse">
                  <tbody>
                    {rows.slice(0, 3).map((r, i) => (
                      <tr key={i}>
                        {r.slice(0, 5).map((c, j) => (
                          <td key={j} className="border px-1 py-0.5">
                            {String(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <button
            onClick={() => setStep(3)}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Continuar
          </button>
        </div>
      )}
      {step === 3 && sheets && (
        <div className="space-y-4">
          <p className="font-semibold">Configura encabezados</p>
          {selected.map((name) => {
            const rows = sheets[name];
            const cfg = configs[name];
            return (
              <div key={name} className="border p-2 rounded space-y-2">
                <p className="font-medium">{name}</p>
                <div className="flex items-center space-x-2">
                  <label className="text-sm">
                    Orientación
                    <select
                      value={cfg.orientation}
                      onChange={(e) =>
                        updateConfig(name, {
                          orientation: e.target.value as HeaderConfig["orientation"],
                        })
                      }
                      className="ml-1 border px-1 py-0.5"
                    >
                      <option value="row">Fila</option>
                      <option value="column">Columna</option>
                    </select>
                  </label>
                  <label className="text-sm">
                    Índice
                    <input
                      type="number"
                      min={1}
                      value={cfg.index + 1}
                      onChange={(e) =>
                        updateConfig(name, { index: Number(e.target.value) - 1 })
                      }
                      className="ml-1 border px-1 py-0.5 w-16"
                    />
                  </label>
                </div>
                <div className="overflow-auto">
                  <table className="text-xs border-collapse mt-2">
                    <tbody>
                      {rows.slice(0, 5).map((r, i) => (
                        <tr key={i}>
                          {r.slice(0, 5).map((c, j) => (
                            <td key={j} className="border px-1 py-0.5">
                              {String(c)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
          <button
            onClick={processData}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Procesar datos
          </button>
        </div>
      )}
      {step === 4 && structured && (
        <div className="space-y-4">
          {Object.entries(structured).map(([name, rows]) => (
            <p key={name}>
              <strong>{name}</strong>: {rows.length} filas procesadas
            </p>
          ))}
          <div className="space-x-2">
            <button
              onClick={downloadJSON}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Descargar JSON
            </button>
            <button
              onClick={downloadXLSX}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Descargar XLSX
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
