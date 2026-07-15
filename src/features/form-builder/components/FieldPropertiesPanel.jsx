import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { getPaletteItem } from '../constants/fieldPalette'

export default function FieldPropertiesPanel({ field, onUpdate, onDelete }) {
  if (!field) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground">
        <p>Select a field on the canvas to edit its properties.</p>
      </div>
    )
  }

  const palette = getPaletteItem(field.type)
  const hasOptions = ['select', 'radio', 'checkbox-group'].includes(field.type)
  const hasContent = ['heading', 'subheading', 'paragraph', 'school-name'].includes(field.type)
  const hasImage = ['logo', 'image'].includes(field.type)

  const update = (patch) => onUpdate({ ...field, ...patch })

  const updateOption = (index, patch) => {
    const options = [...(field.options || [])]
    options[index] = { ...options[index], ...patch }
    update({ options })
  }

  const addOption = () => {
    const n = (field.options?.length || 0) + 1
    const value = `opt${n}-${Date.now().toString(36).slice(-4)}`
    update({ options: [...(field.options || []), { label: `Option ${n}`, value }] })
  }

  const removeOption = (index) => {
    update({ options: (field.options || []).filter((_, i) => i !== index) })
  }

  const uniqueOptionValue = (label, index) => {
    const base = label.toLowerCase().trim().replace(/\s+/g, '-') || `opt${index + 1}`
    const others = (field.options || []).filter((_, i) => i !== index).map((o) => o.value)
    let value = base
    let i = 1
    while (others.includes(value)) value = `${base}-${i++}`
    return value
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold">Field Properties</h3>
        <p className="text-xs text-muted-foreground">{palette?.label || field.type}</p>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {!['divider', 'spacer'].includes(field.type) ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Label</label>
            <input
              value={field.label || ''}
              onChange={(e) => update({ label: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        ) : null}

        {hasContent ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Content</label>
            <textarea
              rows={3}
              value={field.content || ''}
              onChange={(e) => update({ content: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        ) : null}

        {hasImage ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Image URL</label>
            <input
              value={field.imageUrl || ''}
              onChange={(e) => update({ imageUrl: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        ) : null}

        {field.type === 'file' ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Accepted files</label>
            <input
              value={field.accept || ''}
              onChange={(e) => update({ accept: e.target.value })}
              placeholder=".pdf,.jpg,.png"
              className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        ) : null}

        {!['divider', 'spacer', 'submit', 'reset', 'button', 'heading', 'subheading', 'paragraph', 'logo', 'school-name', 'image'].includes(field.type) ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Placeholder</label>
              <input
                value={field.placeholder || ''}
                onChange={(e) => update({ placeholder: e.target.value })}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Help text</label>
              <input
                value={field.helpText || ''}
                onChange={(e) => update({ helpText: e.target.value })}
                className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(field.required)}
                onChange={(e) => update({ required: e.target.checked })}
                className="rounded text-brand-600"
              />
              Required field
            </label>
          </>
        ) : null}

        {['submit', 'reset', 'button'].includes(field.type) ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Button style</label>
            <select
              value={field.buttonVariant || 'primary'}
              onChange={(e) => update({ buttonVariant: e.target.value })}
              className="w-full rounded-lg border border-input px-3 py-2 text-sm"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
            </select>
          </div>
        ) : null}

        {hasOptions ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Options</label>
              <button type="button" onClick={addOption} className="flex items-center gap-1 text-xs text-brand-600 hover:underline">
                <FiPlus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {(field.options || []).map((opt, i) => (
                <div key={`${field.id}-opt-${i}-${opt.value}`} className="flex gap-2">
                  <input
                    value={opt.label}
                    onChange={(e) => updateOption(i, { label: e.target.value, value: uniqueOptionValue(e.target.value, i) })}
                    placeholder="Label"
                    className="flex-1 rounded border border-input px-2 py-1.5 text-xs"
                  />
                  <button type="button" onClick={() => removeOption(i)} className="text-red-500 hover:text-red-700">
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => onDelete(field.id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <FiTrash2 className="h-4 w-4" /> Remove field
        </button>
      </div>
    </div>
  )
}
