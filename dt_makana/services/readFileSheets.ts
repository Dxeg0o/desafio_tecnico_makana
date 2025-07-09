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

        const workbook = XLSX.read(data, { type: "array" })
        const sheets: Record<string, string[][]> = {}

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
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
