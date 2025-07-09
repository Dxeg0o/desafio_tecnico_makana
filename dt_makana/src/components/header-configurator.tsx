"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, RotateCcw, Columns, Rows, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeaderConfig {
  orientation: "row" | "column"
  index: number
}

interface SheetConfig extends HeaderConfig {
  types: ("license" | "accident" | "failure")[]
}

interface HeaderConfiguratorProps {
  sheets: Record<string, string[][]>
  selected: string[]
  configs: Record<string, SheetConfig>
  onUpdateConfig: (sheet: string, partial: Partial<SheetConfig>) => void
  onNext: () => void
  onBack: () => void
}

export const HeaderConfigurator: React.FC<HeaderConfiguratorProps> = ({
  sheets,
  selected,
  configs,
  onUpdateConfig,
  onNext,
  onBack,
}) => {
  const getPreviewHeaders = (sheetName: string) => {
    const rows = sheets[sheetName]
    const config = configs[sheetName]

    if (config.orientation === "row") {
      return rows[config.index] || []
    } else {
      return rows.map((row) => row[config.index] || "")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configura los encabezados</h2>
        <p className="text-gray-600">Define dónde se encuentran los encabezados en cada hoja</p>
      </div>

      <div className="grid gap-6">
        {selected.map((sheetName) => {
          const rows = sheets[sheetName]
          const config = configs[sheetName]
          const previewHeaders = getPreviewHeaders(sheetName)

          return (
            <Card key={sheetName} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <span>{sheetName}</span>
                  </CardTitle>
                  <div className="flex space-x-1">
                    {config.types.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type === "license" ? "Licencias" : type === "accident" ? "Accidentes" : "Fallas"}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Configuración */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Orientación de encabezados</Label>
                      <Select
                        value={config.orientation}
                        onValueChange={(value: "row" | "column") =>
                          onUpdateConfig(sheetName, { orientation: value, index: 0 })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="row">
                            <div className="flex items-center space-x-2">
                              <Rows className="w-4 h-4" />
                              <span>Fila (horizontal)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="column">
                            <div className="flex items-center space-x-2">
                              <Columns className="w-4 h-4" />
                              <span>Columna (vertical)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {config.orientation === "row" ? "Número de fila" : "Número de columna"}
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min={1}
                          max={config.orientation === "row" ? rows.length : rows[0]?.length || 1}
                          value={config.index + 1}
                          onChange={(e) =>
                            onUpdateConfig(sheetName, {
                              index: Math.max(0, Number(e.target.value) - 1),
                            })
                          }
                          className="w-20"
                        />
                        <Button variant="outline" size="sm" onClick={() => onUpdateConfig(sheetName, { index: 0 })}>
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Encabezados detectados</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {previewHeaders.slice(0, 6).map((header, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {String(header) || `Columna ${idx + 1}`}
                          </Badge>
                        ))}
                        {previewHeaders.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{previewHeaders.length - 6} más
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Vista previa */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vista previa</Label>
                    <div className="border rounded-lg overflow-hidden max-h-80">
                      <div className="overflow-auto max-h-full">
                        <table className="w-full text-xs border-collapse">
                          <thead className="sticky top-0 bg-gray-100 z-10">
                            <tr>
                              <th className="px-2 py-2 text-left border-r border-gray-300 font-medium text-gray-700 min-w-12 bg-gray-200">
                                #
                              </th>
                              {rows[0]?.map((_, colIndex) => (
                                <th
                                  key={colIndex}
                                  className={cn(
                                    "px-2 py-2 text-left border-r border-gray-300 font-medium min-w-24 transition-colors duration-150",
                                    config.orientation === "column" && config.index === colIndex
                                      ? "bg-blue-200 text-blue-800"
                                      : "bg-gray-100 text-gray-700",
                                  )}
                                >
                                  Col {colIndex + 1}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row, rowIndex) => (
                              <tr
                                key={rowIndex}
                                className={cn(
                                  "transition-colors duration-150 hover:bg-gray-100",
                                  config.orientation === "row" && config.index === rowIndex
                                    ? "bg-blue-100 border-l-4 border-blue-500"
                                    : rowIndex % 2 === 0
                                      ? "bg-white"
                                      : "bg-gray-50",
                                )}
                              >
                                <td className="px-2 py-1 border-r border-gray-300 text-center font-medium text-gray-500 bg-gray-50 sticky left-0 z-5">
                                  {rowIndex + 1}
                                </td>
                                {row.map((cell, colIndex) => (
                                  <td
                                    key={colIndex}
                                    className={cn(
                                      "px-2 py-1 border-r border-gray-200 min-w-24 max-w-32 truncate transition-colors duration-150 cursor-pointer",
                                      config.orientation === "column" && config.index === colIndex ? "bg-blue-100" : "",
                                    )}
                                    title={String(cell)}
                                    onClick={() => {
                                      if (config.orientation === "column") {
                                        onUpdateConfig(sheetName, { index: colIndex })
                                      } else {
                                        onUpdateConfig(sheetName, { index: rowIndex })
                                      }
                                    }}
                                  >
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
          Procesar datos
        </Button>
      </div>
    </div>
  )
}
