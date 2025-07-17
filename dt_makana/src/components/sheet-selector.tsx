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
  const [loadingSheets, setLoadingSheets] = React.useState<Set<string>>(new Set())
  const [pageBySheet, setPageBySheet] = React.useState<Record<string, number>>({})

  const ROWS_PER_PAGE = 50

  const toggleExpanded = (sheetName: string) => {
    setExpandedSheets((prev) => {
      const next = new Set(prev)
      if (next.has(sheetName)) {
        next.delete(sheetName)
      } else {
        next.add(sheetName)
        if (!loadingSheets.has(sheetName)) {
          setLoadingSheets((p) => new Set(p).add(sheetName))
          setTimeout(
            () =>
              setLoadingSheets((p) => {
                const n = new Set(p)
                n.delete(sheetName)
                return n
              }),
            300,
          )
        }
      }
      return next
    })
  }

  const changePage = (sheet: string, page: number) => {
    setPageBySheet((prev) => ({ ...prev, [sheet]: page }))
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Selecciona las hojas a procesar</h2>
        <p className="text-gray-600">Elige qué hojas deseas incluir y define el tipo de datos</p>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {Object.entries(sheets).map(([name, rows]) => {
          const isSelected = selected.includes(name)
          const config = configs[name]
          const isExpanded = expandedSheets.has(name)
          const page = pageBySheet[name] || 0

          return (
            <Card
              key={name}
              className={cn(
                "transition-all overflow-hidden",
                isSelected && "ring-2 ring-blue-500 bg-blue-50",
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSheet(name)}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <CardTitle className="text-lg">{name}</CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs whitespace-nowrap">
                      {rows.length} filas × {rows[0]?.length || 0} columnas
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => toggleExpanded(name)} className="size-8">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium text-gray-700">Tipos de datos:</p>
                    <div className="flex flex-wrap gap-2">
                      {sheetTypeOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer text-sm">
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
                )}
              </CardHeader>

              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(name)}>
                <CollapsibleContent>
                  <CardContent className="p-0">
                    <div className="border-t">
                      <div className="overflow-auto max-h-80">
                        <table className="w-full text-xs border-collapse min-w-[600px]">
                          <thead className="sticky top-0 bg-gray-100 z-10">
                            <tr>
                              <th className="px-2 py-2 text-left border-r border-gray-300 font-medium bg-gray-200">#</th>
                              {rows[0]?.map((_, colIndex) => (
                                <th
                                  key={colIndex}
                                  className="px-2 py-2 text-left border-r border-gray-300 font-medium bg-gray-100 min-w-24"
                                >
                                  Col {colIndex + 1}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          {loadingSheets.has(name) ? (
                            <tbody>
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <tr key={idx} className="animate-pulse">
                                  <td className="px-2 py-1 border-r border-gray-200 bg-gray-100">
                                    <div className="h-3 bg-gray-300 rounded" />
                                  </td>
                                  {rows[0]?.map((_, colIndex) => (
                                    <td key={colIndex} className="px-2 py-1 border-r border-gray-200">
                                      <div className="h-3 bg-gray-300 rounded" />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          ) : (
                            <tbody>
                              {rows
                                .slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE)
                                .map((row, rowIndex) => {
                                  const absoluteIndex = page * ROWS_PER_PAGE + rowIndex
                                  return (
                                    <tr key={absoluteIndex} className={absoluteIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                      <td className="px-2 py-1 border-r border-gray-300 text-center font-medium text-gray-500 bg-gray-50 sticky left-0 z-5">
                                        {absoluteIndex + 1}
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
                                  )
                                })}
                            </tbody>
                          )}
                        </table>
                      </div>
                      {Math.ceil(rows.length / ROWS_PER_PAGE) > 1 && !loadingSheets.has(name) && (
                        <div className="flex items-center justify-between p-2 text-xs bg-gray-50 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => changePage(name, Math.max(0, page - 1))}
                            disabled={page === 0}
                          >
                            Anterior
                          </Button>
                          <span>
                            {page + 1} / {Math.ceil(rows.length / ROWS_PER_PAGE)}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              changePage(name, Math.min(Math.ceil(rows.length / ROWS_PER_PAGE) - 1, page + 1))
                            }
                            disabled={page >= Math.ceil(rows.length / ROWS_PER_PAGE) - 1}
                          >
                            Siguiente
                          </Button>
                        </div>
                      )}
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

