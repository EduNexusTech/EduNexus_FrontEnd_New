import { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { FIELD_PALETTE, PALETTE_CATEGORIES } from '../constants/fieldPalette'
import { cn } from '@/lib/utils'

const DRAG_TYPE = 'application/x-form-field-type'

export function getDragFieldType(e) {
  return e.dataTransfer.getData(DRAG_TYPE)
}

export function setDragFieldType(e, type) {
  e.dataTransfer.setData(DRAG_TYPE, type)
  e.dataTransfer.effectAllowed = 'copy'
}

export default function FieldPalette({ onAddField }) {
  const [query, setQuery] = useState('')
  const [openCategory, setOpenCategory] = useState(PALETTE_CATEGORIES[0])

  const filtered = FIELD_PALETTE.filter(
    (f) =>
      f.label.toLowerCase().includes(query.toLowerCase()) ||
      f.type.toLowerCase().includes(query.toLowerCase()),
  )

  const categories = query
    ? [...new Set(filtered.map((f) => f.category))]
    : PALETTE_CATEGORIES

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold text-foreground">Field Toolbox</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">Drag fields onto the canvas</p>
        <div className="relative mt-3">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fields..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {categories.map((cat) => {
          const items = filtered.filter((f) => f.category === cat)
          if (!items.length) return null
          const expanded = query ? true : openCategory === cat
          return (
            <div key={cat} className="mb-3">
              <button
                type="button"
                onClick={() => setOpenCategory((c) => (c === cat ? '' : cat))}
                className="mb-2 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {cat}
                <span>{expanded ? '−' : '+'}</span>
              </button>
              {expanded ? (
                <div className="grid grid-cols-2 gap-2">
                  {items.map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.type}
                        draggable
                        onDragStart={(e) => setDragFieldType(e, item.type)}
                        onClick={() => onAddField?.(item.type)}
                        className={cn(
                          'flex cursor-grab flex-col items-center gap-1.5 rounded-lg border border-border bg-card p-2.5 text-center',
                          'transition-colors hover:border-brand-300 hover:bg-brand-50/50 active:cursor-grabbing',
                        )}
                        title={`Drag or click to add ${item.label}`}
                      >
                        <Icon className="h-4 w-4 text-brand-600" />
                        <span className="text-[11px] font-medium leading-tight text-foreground">{item.label}</span>
                      </div>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
