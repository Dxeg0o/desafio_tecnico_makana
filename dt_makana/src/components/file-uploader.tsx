"use client";

import type React from "react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, File, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { readFileSheets } from "../services/readFileSheets";
import { cn } from "@/lib/utils";

export interface FileUploaderProps {
  onFileLoaded?: (data: Record<string, string[][]>) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const sheets = await readFileSheets(file);
        setSuccess(`Archivo "${file.name}" cargado exitosamente`);
        onFileLoaded?.(sheets);
      } catch (error) {
        console.error("FileUploader: error parsing file:", error);
        setError(
          "Ocurrió un error al procesar el archivo. Verifica que sea un archivo válido."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [onFileLoaded]
  );

  const onDropRejected = useCallback(() => {
    setError(
      "El tipo de archivo no es válido. Solo se aceptan archivos CSV, XLSX y XLSM."
    );
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
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
              isDragActive && "border-blue-500 bg-blue-50",
              !isDragActive &&
                "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
              isLoading && "pointer-events-none opacity-50"
            )}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center space-y-4">
              <div
                className={cn(
                  "p-4 rounded-full transition-colors duration-200",
                  isDragActive ? "bg-blue-100" : "bg-gray-100"
                )}
              >
                <FileUp
                  className={cn(
                    "w-8 h-8 transition-colors duration-200",
                    isDragActive ? "text-blue-600" : "text-gray-600"
                  )}
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isDragActive ? "Suelta el archivo aquí" : "Sube tu archivo"}
                </h3>
                <p className="text-sm text-gray-600">
                  {isDragActive
                    ? "Suelta para procesar el archivo"
                    : "Arrastra y suelta tu archivo CSV, XLSX o XLSM aquí"}
                </p>
              </div>

              {!isDragActive && (
                <Button variant="outline" className="mt-4 bg-transparent">
                  <File className="w-4 h-4 mr-2" />
                  Seleccionar archivo
                </Button>
              )}
            </div>

            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Procesando archivo...
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-gray-500 text-center">
        <p>Formatos soportados: CSV, XLSX, XLSM</p>
        <p>Tamaño máximo: 10MB</p>
      </div>
    </div>
  );
};
