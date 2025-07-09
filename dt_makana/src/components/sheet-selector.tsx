"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface SheetConfig {
  types: ("license" | "accident" | "failure")[]
  orientation: "row" | "column"
  index: number
}

interface SheetSelectorProps {
  sheets: Record<string, string[][]>
  selected: string[]
  configs: Record<string, SheetConfig>
  onToggleSheet: (name: string) => void
  onUpdateConfig: (sheet: string, partial: Partial<SheetConfig>) => void
  onNext: () => void
  onBack: () => void
}

const sheetTypeOptions = [
  { value: "license" as const, label: "Licencias", color: "bg-blue-100 text-blue-800" },
  { value: "accident" as const, label: "Accidentes", color: "bg-red-100 text-red-800" },
  { value: "failure" as const, label: "Fallas", color: "bg-yellow-100 text-yellow-800" },
]

export const SheetSelector: React.FC<SheetSelectorProps> = ({
  sheets,
  selected,
  configs,
  onToggleSheet,
  onUpdateConfig,
  onNext,
  onBack,
}) => {
  const [expandedSheets, setExpandedSheets] = React.useState<Set<string>>(new Set())

  const toggleExpanded = (sheetName: string) => {
    const newExpanded = new Set(expandedSheets)
    if (newExpanded.has(sheetName)) {
      newExpanded.delete(sheetName)
    } else {
      newExpanded.add(sheetName)
    }
    setExpandedSheets(newExpanded)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona las hojas a procesar</h2>
        <p className="text-gray-600">Elige qué hojas quieres incluir y configura el tipo de datos que contienen</p>
      </div>

      <div className="grid gap-4">
        {Object.entries(sheets).map(([name, rows]) => {
          const isSelected = selected.includes(name)
          const config = configs[name]
          const isExpanded = expandedSheets.has(name)

          return (
            <Card
              key={name}
              className={cn(
                "transition-all duration-200",
                isSelected ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSheet(name)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <CardTitle className="text-lg">{name}</CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {rows.length} filas × {rows[0]?.length || 0} columnas
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => toggleExpanded(name)} className="h-8 w-8 p-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Tipos de datos en esta hoja:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {sheetTypeOptions.map((option) => (
                          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                            <Checkbox
                              checked={config.types.includes(option.value)}
                              onCheckedChange={() => {
                                const current = config.types
                                const updated = current.includes(option.value)
                                  ? current.filter((t) => t !== option.value)
                                  : [...current, option.value]
                                onUpdateConfig(name, { types: updated })
                              }}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <Badge className={option.color}>{option.label}</Badge>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>

              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(name)}>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
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
                                    className="px-2 py-2 text-left border-r border-gray-300 font-medium min-w-24 bg-gray-100 text-gray-700"
                                  >
                                    Col {colIndex + 1}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                  <td className="px-2 py-1 border-r border-gray-300 text-center font-medium text-gray-500 bg-gray-50 sticky left-0 z-5">
                                    {rowIndex + 1}
                                  </td>
                                  {row.map((cell, colIndex) => (
                                    <td
                                      key={colIndex}
                                      className="px-2 py-1 border-r border-gray-200 min-w-24 max-w-32 truncate"
                                      title={String(cell)}
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
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Atrás
        </Button>
        <Button onClick={onNext} disabled={selected.length === 0} className="bg-blue-600 hover:bg-blue-700">
          Continuar ({selected.length} hojas seleccionadas)
        </Button>
      </div>
    </div>
  )
}
