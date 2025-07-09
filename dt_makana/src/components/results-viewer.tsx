"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileJson, FileSpreadsheet, CheckCircle2, Database } from "lucide-react"
import * as XLSX from "xlsx"

interface ResultsViewerProps {
  structured: Record<string, Record<string, unknown>[]>
  onBack: () => void
}

export const ResultsViewer: React.FC<ResultsViewerProps> = ({ structured, onBack }) => {
  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(structured, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "datos_procesados.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadXLSX = () => {
    const wb = XLSX.utils.book_new()
    Object.entries(structured).forEach(([name, rows]) => {
      const ws = XLSX.utils.json_to_sheet(rows)
      XLSX.utils.book_append_sheet(wb, ws, name)
    })
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "datos_procesados.xlsx"
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalRecords = Object.values(structured).reduce((sum, rows) => sum + rows.length, 0)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">¡Procesamiento completado!</h2>
        </div>
        <p className="text-gray-600">
          Se han procesado exitosamente <strong>{totalRecords} registros</strong> en {Object.keys(structured).length}{" "}
          hojas
        </p>
      </div>

      {/* Resumen de resultados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(structured).map(([sheetName, rows]) => (
          <Card key={sheetName} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span>{sheetName}</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{rows.length} registros</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Campos detectados:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.keys(rows[0] || {})
                      .slice(0, 4)
                      .map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    {Object.keys(rows[0] || {}).length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{Object.keys(rows[0] || {}).length - 4} más
                      </Badge>
                    )}
                  </div>
                </div>

                {rows.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <p>Primer registro:</p>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono">
                      {JSON.stringify(rows[0], null, 2).slice(0, 100)}...
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Botones de descarga */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-gray-700" />
            <span>Descargar resultados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={downloadJSON} className="flex-1 bg-transparent" variant="outline">
              <FileJson className="w-4 h-4 mr-2" />
              Descargar JSON
              <Badge variant="secondary" className="ml-2">
                {(JSON.stringify(structured).length / 1024).toFixed(1)} KB
              </Badge>
            </Button>
            <Button onClick={downloadXLSX} className="flex-1 bg-transparent" variant="outline">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Descargar XLSX
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Los archivos contienen todos los datos procesados y normalizados
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-6">
        <Button variant="outline" onClick={onBack}>
          Procesar otro archivo
        </Button>
      </div>
    </div>
  )
}
