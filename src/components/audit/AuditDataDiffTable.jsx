import { cn } from '@/utils/format'

function parsePayload(value) {
  if (value == null || value === '') return null
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return { value }
    }
  }
  if (typeof value === 'object') return value
  return { value }
}

function formatCell(value) {
  if (value === undefined) return '—'
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function humanizeKey(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function flattenObject(input, prefix = '', out = {}) {
  if (input == null || typeof input !== 'object' || Array.isArray(input)) {
    out[prefix || 'value'] = input
    return out
  }

  const keys = Object.keys(input)
  if (!keys.length) {
    if (prefix) out[prefix] = {}
    return out
  }

  keys.forEach((key) => {
    const path = prefix ? `${prefix}.${key}` : key
    const val = input[key]
    if (val != null && typeof val === 'object' && !Array.isArray(val)) {
      flattenObject(val, path, out)
    } else {
      out[path] = val
    }
  })
  return out
}

function buildRows(oldData, newData) {
  const oldObj = parsePayload(oldData)
  const newObj = parsePayload(newData)
  const oldFlat = oldObj && typeof oldObj === 'object' && !Array.isArray(oldObj) ? flattenObject(oldObj) : {}
  const newFlat = newObj && typeof newObj === 'object' && !Array.isArray(newObj) ? flattenObject(newObj) : {}

  if (
    (oldObj == null || (typeof oldObj === 'object' && !Object.keys(oldFlat).length)) &&
    (newObj == null || (typeof newObj === 'object' && !Object.keys(newFlat).length))
  ) {
    return []
  }

  // If payload is a primitive / array wrapper
  if (Array.isArray(oldObj) || Array.isArray(newObj)) {
    return [
      {
        field: 'Data',
        oldValue: formatCell(oldObj),
        newValue: formatCell(newObj),
        changed: JSON.stringify(oldObj) !== JSON.stringify(newObj),
      },
    ]
  }

  const keys = Array.from(new Set([...Object.keys(oldFlat), ...Object.keys(newFlat)])).sort((a, b) =>
    a.localeCompare(b),
  )

  return keys.map((key) => {
    const oldRaw = oldFlat[key]
    const newRaw = newFlat[key]
    const oldValue = Object.prototype.hasOwnProperty.call(oldFlat, key) ? formatCell(oldRaw) : '—'
    const newValue = Object.prototype.hasOwnProperty.call(newFlat, key) ? formatCell(newRaw) : '—'
    return {
      field: humanizeKey(key),
      oldValue,
      newValue,
      changed: oldValue !== newValue,
    }
  })
}

/**
 * Renders audit old_data / new_data as a Field | Old | New comparison table.
 */
export default function AuditDataDiffTable({ oldData, newData, className }) {
  const rows = buildRows(oldData, newData)

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--clay-glass-edge)] bg-slate-50/80 px-4 py-6 text-center text-sm text-[var(--clay-primary-soft)]">
        No field changes recorded.
      </div>
    )
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-[var(--clay-glass-edge)] bg-white',
        className,
      )}
    >
      <div className="max-h-80 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[#eff6ff]">
            <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-[#1d4ed8]">
              <th className="border-b border-[var(--clay-glass-edge)] px-3 py-2.5">Field</th>
              <th className="border-b border-[var(--clay-glass-edge)] px-3 py-2.5">Old value</th>
              <th className="border-b border-[var(--clay-glass-edge)] px-3 py-2.5">New value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.field}
                className={cn(
                  'border-b border-slate-100 last:border-b-0',
                  row.changed ? 'bg-[#fefce8]/60' : 'bg-white',
                )}
              >
                <td className="px-3 py-2.5 align-top font-semibold text-[var(--clay-text-sharp)]">
                  {row.field}
                  {row.changed ? (
                    <span className="ml-2 rounded-full bg-[#fef3c7] px-1.5 py-0.5 text-[10px] font-bold text-[#92400e]">
                      Changed
                    </span>
                  ) : null}
                </td>
                <td
                  className={cn(
                    'max-w-[220px] break-words px-3 py-2.5 align-top text-[var(--clay-primary-soft)]',
                    row.changed && 'text-[#991b1b]',
                  )}
                >
                  {row.oldValue}
                </td>
                <td
                  className={cn(
                    'max-w-[220px] break-words px-3 py-2.5 align-top text-[var(--clay-primary-soft)]',
                    row.changed && 'font-semibold text-[#166534]',
                  )}
                >
                  {row.newValue}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
