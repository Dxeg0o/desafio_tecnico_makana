import * as XLSX from "xlsx"

export async function readFileSheets(file: File): Promise<Record<string, string[][]>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        if (!data) {
          reject(new Error("No se pudo leer el archivo"))
          return
        }

        // Enable cellDates so Excel date cells are parsed as JavaScript Dates
        const workbook = XLSX.read(data, { type: "array", cellDates: true })
        const sheets: Record<string, string[][]> = {}

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
            // raw:false ensures date values are formatted as strings
            raw: false,
          }) as string[][]
          sheets[sheetName] = jsonData
        })

        resolve(sheets)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Error al leer el archivo"))
    reader.readAsArrayBuffer(file)
  })
}
