/** Parse CSV text into row objects keyed by header names (lowercase). */
export function parseCsvText(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (!lines.length) return []

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  const rows = []

  for (let i = 1; i < lines.length; i += 1) {
    const cells = parseCsvLine(lines[i])
    if (cells.every((c) => !String(c || '').trim())) continue

    const row = {}
    headers.forEach((header, index) => {
      if (!header) return
      row[header] = (cells[index] ?? '').trim()
    })
    rows.push(row)
  }

  return rows
}

function parseCsvLine(line) {
  const cells = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        current += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      cells.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current)
  return cells
}

function escapeCsvCell(value) {
  const str = value === null || value === undefined ? '' : String(value)
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

/** Build a CSV string with UTF-8 BOM for Excel. */
export function buildSampleCsv(columns, exampleRows = []) {
  const headers = columns.map((c) => c.header)
  const lines = [headers.join(',')]

  exampleRows.forEach((row) => {
    lines.push(headers.map((header) => escapeCsvCell(row[header] ?? '')).join(','))
  })

  return `\uFEFF${lines.join('\n')}`
}

export function parseBooleanCell(value, defaultValue = true) {
  if (value === '' || value === null || value === undefined) return defaultValue
  const normalized = String(value).trim().toLowerCase()
  if (['yes', 'y', 'true', '1', 'active'].includes(normalized)) return true
  if (['no', 'n', 'false', '0', 'inactive'].includes(normalized)) return false
  return defaultValue
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function isValidDateParts(year, month, day) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const dt = new Date(Date.UTC(year, month - 1, day))
  return (
    dt.getUTCFullYear() === year &&
    dt.getUTCMonth() === month - 1 &&
    dt.getUTCDate() === day
  )
}

function toIsoDate(year, month, day) {
  if (!isValidDateParts(year, month, day)) return null
  return `${year}-${pad2(month)}-${pad2(day)}`
}

/** Convert Excel/CSV date strings (DD-MM-YYYY, etc.) to API format YYYY-MM-DD. */
export function normalizeDateCell(value, { rowIndex = 0, fieldName = 'date' } = {}) {
  if (value === '' || value === null || value === undefined) return value

  const text = String(value).trim()
  if (!text) return text

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text

  const dmy = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
  if (dmy) {
    const partA = Number(dmy[1])
    const partB = Number(dmy[2])
    const year = Number(dmy[3])
    let day
    let month
    if (partA > 12) {
      day = partA
      month = partB
    } else if (partB > 12) {
      month = partA
      day = partB
    } else {
      // Ambiguous — prefer DD-MM-YYYY (common Excel locale in India).
      day = partA
      month = partB
    }
    const iso = toIsoDate(year, month, day)
    if (iso) return iso
  }

  const ymd = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (ymd) {
    const iso = toIsoDate(Number(ymd[1]), Number(ymd[2]), Number(ymd[3]))
    if (iso) return iso
  }

  const serial = Number(text)
  if (Number.isFinite(serial) && serial >= 1 && serial <= 60000 && !text.includes('-')) {
    const epoch = Date.UTC(1899, 11, 30)
    const ms = epoch + serial * 86400000
    const dt = new Date(ms)
    const iso = toIsoDate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
    if (iso) return iso
  }

  throw new Error(
    `Row ${rowIndex + 2}: invalid date "${text}" in ${fieldName}. Use DD-MM-YYYY or YYYY-MM-DD.`,
  )
}

function isDateColumn(col) {
  return col.type === 'date' || /_date$/.test(col.key) || col.key.endsWith('_date')
}

/** Map parsed CSV rows to API payload fields using bulk-import column config. */
export function mapCsvRowsToItems(rows, columns) {
  return rows.map((row, rowIndex) => {
    const item = {}
    columns.forEach((col) => {
      const raw = row[col.header.toLowerCase()] ?? row[col.key.toLowerCase()]
      if (raw === '' || raw === undefined) {
        if (col.default !== undefined) item[col.key] = col.default
        return
      }
      if (col.type === 'number') {
        const num = Number(raw)
        item[col.key] = Number.isFinite(num) ? num : col.default ?? 0
        return
      }
      if (col.type === 'boolean') {
        item[col.key] = parseBooleanCell(raw, col.default ?? true)
        return
      }
      if (isDateColumn(col)) {
        try {
          item[col.key] = normalizeDateCell(raw, { rowIndex, fieldName: col.header })
        } catch (err) {
          throw err
        }
        return
      }
      if (col.type === 'choice' && col.choices?.length) {
        try {
          item[col.key] = col.normalizeChoice
            ? col.normalizeChoice(raw)
            : raw
        } catch (err) {
          throw new Error(`Row ${rowIndex + 2}: ${err.message}`)
        }
        return
      }
      if (col.key === 'code') {
        item[col.key] = String(raw).trim().toLowerCase()
        return
      }
      item[col.key] = raw
    })
    return item
  })
}
