import * as XLSX from 'xlsx'
import { parseCsvText } from '@/utils/csvImport'

function normalizeRowKeys(row) {
  const normalized = {}
  Object.entries(row || {}).forEach(([key, value]) => {
    const header = String(key).trim().toLowerCase()
    if (!header) return
    if (value === null || value === undefined) {
      normalized[header] = ''
      return
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, '0')
      const day = String(value.getDate()).padStart(2, '0')
      normalized[header] = `${year}-${month}-${day}`
      return
    }
    normalized[header] = String(value).trim()
  })
  return normalized
}

/** Parse uploaded CSV or Excel (.xlsx / .xls) into row objects with lowercase headers. */
export async function parseSpreadsheetFile(file) {
  if (!file) return []

  const name = file.name.toLowerCase()
  if (name.endsWith('.csv')) {
    const text = await file.text()
    return parseCsvText(text)
  }

  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) return []
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false })
    return rows.map(normalizeRowKeys).filter((row) => Object.values(row).some(Boolean))
  }

  throw new Error('Upload a .xlsx, .xls, or .csv file')
}
