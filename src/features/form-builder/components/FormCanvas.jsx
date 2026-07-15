import { FiMove, FiCopy, FiTrash2 } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import FieldRenderer from './FieldRenderer'
import { getDragFieldType } from './FieldPalette'
import { createFieldFromPalette } from '../utils/fieldFactory'
import { createId } from '../utils/createId'

const REORDER_TYPE = 'application/x-form-field-id'

export default function FormCanvas({
  fields,
  selectedId,
  onSelect,
  onChangeFields,
  schoolName,
  logoUrl,
  mode = 'design',
}) {
  const addFieldAt = (type, index = fields.length) => {
    const next = [...fields]
    next.splice(index, 0, createFieldFromPalette(type))
    onChangeFields(next)
    onSelect?.(next[index].id)
  }

  const moveField = (fromId, toIndex) => {
    const fromIndex = fields.findIndex((f) => f.id === fromId)
    if (fromIndex < 0 || fromIndex === toIndex) return
    const next = [...fields]
    const [item] = next.splice(fromIndex, 1)
    const insertAt = toIndex > fromIndex ? toIndex - 1 : toIndex
    next.splice(insertAt, 0, item)
    onChangeFields(next)
  }

  const handleDrop = (e, index) => {
    e.preventDefault()
    const reorderId = e.dataTransfer.getData(REORDER_TYPE)
    const newType = getDragFieldType(e)
    if (reorderId) {
      moveField(reorderId, index)
    } else if (newType) {
      addFieldAt(newType, index)
    }
  }

  const duplicateField = (id) => {
    const idx = fields.findIndex((f) => f.id === id)
    if (idx < 0) return
    const copy = { ...fields[idx], id: createId('fld') }
    const next = [...fields]
    next.splice(idx + 1, 0, copy)
    onChangeFields(next)
    onSelect?.(copy.id)
  }

  const removeField = (id) => {
    onChangeFields(fields.filter((f) => f.id !== id))
    if (selectedId === id) onSelect?.(null)
  }

  return (
    <div
      className={cn(
        'min-h-[480px] rounded-xl border-2 border-dashed border-border bg-white p-6 shadow-sm',
        mode === 'design' && 'bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:20px_20px]',
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, fields.length)}
    >
      {fields.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center text-center text-muted-foreground">
          <p className="text-sm font-medium">Drop fields here to build your form</p>
          <p className="mt-1 text-xs">Drag from the toolbox or click a field to add it</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              onDragOver={(e) => {
                e.preventDefault()
                e.currentTarget.classList.add('ring-2', 'ring-brand-300')
              }}
              onDragLeave={(e) => e.currentTarget.classList.remove('ring-2', 'ring-brand-300')}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                e.currentTarget.classList.remove('ring-2', 'ring-brand-300')
                handleDrop(e, index)
              }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => mode === 'design' && onSelect?.(field.id)}
                onKeyDown={(e) => e.key === 'Enter' && mode === 'design' && onSelect?.(field.id)}
                draggable={mode === 'design'}
                onDragStart={(e) => {
                  e.dataTransfer.setData(REORDER_TYPE, field.id)
                  e.dataTransfer.effectAllowed = 'move'
                }}
                className={cn(
                  'group relative rounded-lg border p-4 transition-all',
                  mode === 'design' && 'cursor-pointer hover:border-brand-200',
                  selectedId === field.id && mode === 'design'
                    ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/30'
                    : 'border-transparent hover:bg-muted/30',
                )}
              >
                {mode === 'design' ? (
                  <div className="absolute -left-2 top-3 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="rounded bg-white p-1 shadow border border-border text-muted-foreground" title="Drag to reorder">
                      <FiMove className="h-3.5 w-3.5" />
                    </span>
                  </div>
                ) : null}
                {mode === 'design' && selectedId === field.id ? (
                  <div className="absolute -right-2 -top-2 flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); duplicateField(field.id) }}
                      className="rounded bg-white p-1.5 shadow border border-border text-muted-foreground hover:text-brand-600"
                      title="Duplicate"
                    >
                      <FiCopy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeField(field.id) }}
                      className="rounded bg-white p-1.5 shadow border border-border text-muted-foreground hover:text-red-600"
                      title="Delete"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : null}
                <FieldRenderer field={field} mode={mode} schoolName={schoolName} logoUrl={logoUrl} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
