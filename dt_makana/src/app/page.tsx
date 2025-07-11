"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/step-indicator";
import { SheetSelector } from "@/components/sheet-selector";
import { HeaderConfigurator } from "@/components/header-configurator";
import { ResultsViewer } from "@/components/results-viewer";
import { convertSheetData, type HeaderConfig } from "@/utils/convertSheetData";
import { chunkArray } from "@/utils/chunkArray";
import { FileUploader } from "@/components/file-uploader";
import { classifySheet } from "@/services/classifySheet";
import { describeColumns } from "@/services/describeColumns";
import { LoadingOverlay } from "@/components/loading-overlay";
import { type PersonnelEvent } from "@/types";

interface SheetConfig extends HeaderConfig {
  types: ("license" | "accident" | "failure")[];
}

const steps = [
  {
    title: "Subir archivo",
    description: "Selecciona tu archivo CSV o Excel",
  },
  {
    title: "Seleccionar hojas",
    description: "Elige las hojas a procesar",
  },
  {
    title: "Configurar encabezados",
    description: "Define la estructura de datos",
  },
  {
    title: "Resultados",
    description: "Descarga los datos procesados",
  },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sheets, setSheets] = useState<Record<string, string[][]>>();
  const [selectedSheets, setSelectedSheets] = useState<string[]>([]);
  const [sheetConfigs, setSheetConfigs] = useState<Record<string, SheetConfig>>(
    {}
  );
  const [processedData, setProcessedData] =
    useState<Record<string, PersonnelEvent[]>>();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileLoaded = (data: Record<string, string[][]>) => {
    setSheets(data);
    setSelectedSheets(Object.keys(data));

    // Initialize configs for all sheets
    const configs: Record<string, SheetConfig> = {};
    Object.keys(data).forEach((name) => {
      configs[name] = {
        types: [],
        orientation: "row",
        index: 0,
      };
    });
    setSheetConfigs(configs);
    setCurrentStep(2);
  };

  const updateSheetConfig = (sheet: string, partial: Partial<SheetConfig>) => {
    setSheetConfigs((prev) => ({
      ...prev,
      [sheet]: { ...prev[sheet], ...partial },
    }));
  };

  const toggleSheetSelection = (name: string) => {
    setSelectedSheets((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const processData = async () => {
    if (!sheets) return;

    setIsProcessing(true);

    const results: Record<string, PersonnelEvent[]> = {};
    await Promise.all(
      selectedSheets.map(async (name) => {
        const rows = sheets[name];
        const config = sheetConfigs[name];
        if (!rows || !config) return;

        const structured = convertSheetData(rows, config);

        const headers =
          config.orientation === "row"
            ? (rows[config.index] || []).map((h) => String(h))
            : rows.map((r) => String(r[config.index] || ""));
        const sampleRows =
          config.orientation === "row"
            ? rows.slice(config.index + 1, config.index + 11)
            : rows.slice(0, 10).map((r) => r.slice(config.index + 1));

        const descriptions = await describeColumns({ headers, sampleRows });

        const chunks = chunkArray(structured, 20);
        const events: PersonnelEvent[] = [];
        for (const chunk of chunks) {
          try {
            const classified = await classifySheet({
              rows: chunk,
              types: config.types,
              descriptions,
            });
            events.push(...classified);
          } catch (err) {
            console.error("classification error", err);
          }
        }
        results[name] = events;
      })
    );

    setProcessedData(results);
    setIsProcessing(false);
    setCurrentStep(4);
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSheets(undefined);
    setSelectedSheets([]);
    setSheetConfigs({});
    setProcessedData(undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Procesador de Archivos
          </h1>
          <p className="text-lg text-gray-600">
            Convierte y estructura tus datos de Excel y CSV de manera
            inteligente
          </p>
        </div>

        <StepIndicator
          currentStep={currentStep}
          steps={steps}
          onStepChange={(step) => step < currentStep && setCurrentStep(step)}
        />

        <div className="bg-white rounded-xl shadow-lg p-8 relative">
          {isProcessing && <LoadingOverlay message="Clasificando datos..." />}
          {currentStep === 1 && (
            <FileUploader onFileLoaded={handleFileLoaded} />
          )}

          {currentStep === 2 && sheets && (
            <SheetSelector
              sheets={sheets}
              selected={selectedSheets}
              configs={sheetConfigs}
              onToggleSheet={toggleSheetSelection}
              onUpdateConfig={updateSheetConfig}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && sheets && (
            <HeaderConfigurator
              sheets={sheets}
              selected={selectedSheets}
              configs={sheetConfigs}
              onUpdateConfig={updateSheetConfig}
              onNext={processData}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && processedData && (
            <ResultsViewer structured={processedData} onBack={resetFlow} />
          )}
        </div>
      </div>
    </div>
  );
}
