import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiEdit2 } from 'react-icons/fi'
import FieldRenderer from '../components/FieldRenderer'
import { getFormById } from '../services/formStorage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function FormPreviewPage() {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      const row = await getFormById(id)
      if (active) {
        setForm(row)
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading preview…
      </div>
    )
  }

  if (!form) return <NotFoundPage />

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/form-builder" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <FiArrowLeft className="h-4 w-4" /> Back to forms
        </Link>
        <Link
          to={`/form-builder/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          <FiEdit2 className="h-4 w-4" /> Edit
        </Link>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Preview mode</span>
        </div>
        {form.description ? <p className="mb-4 text-sm text-muted-foreground">{form.description}</p> : null}
        <div className="space-y-5">
          {form.fields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              mode="preview"
              schoolName={form.schoolName}
              logoUrl={form.logoUrl}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
