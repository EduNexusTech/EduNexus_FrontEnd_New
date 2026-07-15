import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiEye, FiSave, FiSend, FiArrowLeft, FiEdit3, FiCpu, FiLayers, FiSliders, FiSettings } from 'react-icons/fi'
import FieldPalette from '../components/FieldPalette'
import FormCanvas from '../components/FormCanvas'
import FieldPropertiesPanel from '../components/FieldPropertiesPanel'
import AiFormBuilderPanel from '../components/AiFormBuilderPanel'
import PublishSuccessPanel from '../components/PublishSuccessPanel'
import FormSettingsPanel from '../components/FormSettingsPanel'
import { createFieldFromPalette } from '../utils/fieldFactory'
import { publishForm, saveForm } from '../services/formStorage'
import { Drawer } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

export default function FormDesigner({ form: initialForm }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState(initialForm)
  const [selectedId, setSelectedId] = useState(null)
  const [buildMode, setBuildMode] = useState(searchParams.get('mode') === 'ai' ? 'ai' : 'manual')
  const [published, setPublished] = useState(null)
  const [saving, setSaving] = useState(false)
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false)
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const selectedField = form.fields.find((f) => f.id === selectedId) ?? null

  const addField = (type) => {
    const f = createFieldFromPalette(type)
    setForm((p) => ({ ...p, fields: [...p.fields, f] }))
    setSelectedId(f.id)
    setMobilePaletteOpen(false)
  }

  const updateField = (updated) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === updated.id ? updated : f)),
    }))
  }

  const handleSave = (silent = false) => {
    if (saving) return form
    if (!form?.id) {
      toast.error('Cannot save: form id is missing')
      return null
    }
    setSaving(true)
    try {
      const saved = saveForm(form)
      if (!saved) {
        toast.error('Save failed')
        return null
      }
      setForm(saved)
      if (!silent) toast.success('Form saved')
      return saved
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    const saved = handleSave(true)
    if (!saved?.id) return
    navigate(`/form-builder/${saved.id}/preview`)
  }

  const handlePublish = () => {
    if (saving) return
    const saved = handleSave(true)
    if (!saved?.id) return
    const pub = publishForm(saved.id)
    if (!pub) {
      toast.error('Publish failed')
      return
    }
    setForm(pub)
    setPublished(pub)
    toast.success('Form published — URL is ready to share!')
  }

  const handleAiGenerated = (generated) => {
    setForm((prev) => ({
      ...prev,
      // Keep the user-entered form name as the list/display title.
      description: generated.description || prev.description,
      fields: generated.fields,
      settings: { ...prev.settings, ...generated.settings },
    }))
    setBuildMode('manual')
    toast.success('AI form generated — customize fields below')
  }

  const selectField = (id) => {
    setSelectedId(id)
    if (id && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobilePropsOpen(true)
    }
  }

  return (
    <div className="-m-4 flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden lg:-m-6">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={() => navigate('/form-builder')} className="rounded-lg p-2 hover:bg-muted" aria-label="Back">
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <input
              value={form.formName || form.title}
              onChange={(e) => setForm((p) => ({ ...p, formName: e.target.value, title: e.target.value }))}
              className="w-full max-w-md truncate border-0 bg-transparent text-lg font-semibold outline-none focus:ring-0"
            />
            <p className="text-xs text-muted-foreground">
              {form.status === 'published' ? 'Published' : 'Draft'} · {form.fields.length} fields
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setBuildMode('manual')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                buildMode === 'manual'
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <FiEdit3 className="h-3.5 w-3.5" />
              Manual
            </button>
            <button
              type="button"
              onClick={() => setBuildMode('ai')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                buildMode === 'ai'
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <FiCpu className="h-3.5 w-3.5" />
              AI Generate
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            <FiSettings className="h-4 w-4" /> Settings
          </button>
          <button
            type="button"
            onClick={handlePreview}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
          >
            <FiEye className="h-4 w-4" /> Preview
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
          >
            <FiSave className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <FiSend className="h-4 w-4" /> Publish & Get URL
          </button>
        </div>
      </header>

      {published ? (
        <div className="shrink-0 border-b border-border p-4">
          <PublishSuccessPanel form={published} onClose={() => setPublished(null)} />
        </div>
      ) : null}

      {buildMode === 'ai' ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-3xl">
            <AiFormBuilderPanel schoolName={form.schoolName} onGenerated={handleAiGenerated} />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              After generation you will switch to Manual mode to edit fields on the canvas.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[240px_1fr_280px]">
          <aside className="hidden min-h-0 overflow-hidden border-r border-border bg-card lg:block">
            <FieldPalette onAddField={addField} />
          </aside>

          <main className="min-h-0 overflow-y-auto p-4 pb-20 lg:p-6 lg:pb-6">
            <div className="mx-auto max-w-2xl space-y-4">
              <div className="flex gap-2 lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobilePaletteOpen(true)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <FiLayers className="h-4 w-4 text-brand-600" /> Add fields
                </button>
                <button
                  type="button"
                  onClick={() => setMobilePropsOpen(true)}
                  disabled={!selectedField}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-40"
                >
                  <FiSliders className="h-4 w-4 text-brand-600" /> Properties
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">School name</label>
                  <input
                    value={form.schoolName || ''}
                    onChange={(e) => setForm((p) => ({ ...p, schoolName: e.target.value }))}
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Logo URL</label>
                  <input
                    value={form.logoUrl || ''}
                    onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-input px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <FormCanvas
                fields={form.fields}
                selectedId={selectedId}
                onSelect={selectField}
                onChangeFields={(fields) => setForm((p) => ({ ...p, fields }))}
                schoolName={form.schoolName}
                logoUrl={form.logoUrl}
                mode="design"
              />
            </div>
          </main>

          <aside className="hidden min-h-0 overflow-hidden border-l border-border bg-card lg:block">
            <FieldPropertiesPanel
              field={selectedField}
              onUpdate={updateField}
              onDelete={(id) => {
                setForm((p) => ({ ...p, fields: p.fields.filter((f) => f.id !== id) }))
                setSelectedId(null)
              }}
            />
          </aside>
        </div>
      )}

      <Drawer open={mobilePaletteOpen} onClose={() => setMobilePaletteOpen(false)} title="Add fields" side="left" maxWidth="md">
        <div className="-m-6 h-[calc(100%-0px)]">
          <FieldPalette onAddField={addField} />
        </div>
      </Drawer>

      <Drawer open={mobilePropsOpen} onClose={() => setMobilePropsOpen(false)} title="Field properties" maxWidth="md">
        <div className="-m-6 h-full">
          <FieldPropertiesPanel
            field={selectedField}
            onUpdate={updateField}
            onDelete={(id) => {
              setForm((p) => ({ ...p, fields: p.fields.filter((f) => f.id !== id) }))
              setSelectedId(null)
              setMobilePropsOpen(false)
            }}
          />
        </div>
      </Drawer>

      <Drawer open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Form settings" maxWidth="md">
        <FormSettingsPanel
          form={form}
          onChange={setForm}
          onClose={() => setSettingsOpen(false)}
        />
      </Drawer>
    </div>
  )
}
