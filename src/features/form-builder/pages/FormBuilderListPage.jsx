import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiLink, FiCpu, FiFileText } from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import Card from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import CreateFormModal from '../components/CreateFormModal'
import { createEmptyForm, deleteForm, getPublicFormUrl, listForms, saveForm } from '../services/formStorage'
import toast from 'react-hot-toast'

export default function FormBuilderListPage() {
  const navigate = useNavigate()
  const [forms, setForms] = useState(() => listForms())
  const [createOpen, setCreateOpen] = useState(false)

  const refresh = () => setForms(listForms())

  // Always reload from storage when visiting the list (and heal any duplicates)
  useEffect(() => {
    refresh()
  }, [])

  const stats = useMemo(() => ({
    total: forms.length,
    published: forms.filter((f) => f.status === 'published').length,
    draft: forms.filter((f) => f.status === 'draft').length,
  }), [forms])

  const handleCreate = (title, { method = 'manual' } = {}) => {
    const form = createEmptyForm({ title, formName: title })
    const saved = saveForm(form)
    if (!saved) {
      toast.error('Could not create form')
      return
    }
    setCreateOpen(false)
    toast.success(`"${title}" created`)
    navigate(`/form-builder/${saved.id}/edit${method === 'ai' ? '?mode=ai' : ''}`)
  }

  const handleDelete = (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return
    deleteForm(id)
    refresh()
    toast.success('Form deleted')
  }

  const copyUrl = async (slug) => {
    const url = getPublicFormUrl(slug)
    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copied')
    } catch {
      toast.error('Could not copy URL')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Form Builder"
        description="Design drag-and-drop forms, use AI to generate layouts, publish shareable URLs for parents."
        actions={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <FiPlus className="h-4 w-4" /> New Form
          </button>
        }
      />

      <CreateFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="!p-4">
          <p className="text-sm text-muted-foreground">Total Forms</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold text-amber-600">{stats.draft}</p>
        </Card>
      </div>

      {forms.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <FiFileText className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No forms yet</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Create your first form with drag-and-drop fields or let AI build one from a prompt.
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
          >
            <FiPlus className="h-4 w-4" /> Create Form
          </button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {forms.map((form) => {
            const displayName = form.formName || form.title || 'Untitled Form'
            return (
            <Card key={form.id} hover className="flex flex-col !p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold">{displayName}</h3>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {form.description || `${form.fields.length} fields`}
                  </p>
                </div>
                <Badge variant={form.status === 'published' ? 'success' : 'warning'}>
                  {form.status}
                </Badge>
              </div>
              {form.settings?.aiGenerated ? (
                <span className="mt-2 inline-flex items-center gap-1 text-xs text-brand-600">
                  <FiCpu className="h-3 w-3" /> AI generated
                </span>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <Link
                  to={`/form-builder/${form.id}/edit`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted"
                >
                  <FiEdit2 className="h-3.5 w-3.5" /> Edit
                </Link>
                <Link
                  to={`/form-builder/${form.id}/preview`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted"
                >
                  <FiEye className="h-3.5 w-3.5" /> Preview
                </Link>
                {form.status === 'published' ? (
                  <button
                    type="button"
                    onClick={() => copyUrl(form.slug)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted"
                  >
                    <FiLink className="h-3.5 w-3.5" /> Copy URL
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(form.id, displayName)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  <FiTrash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
          )})}
        </div>
      )}
    </div>
  )
}
