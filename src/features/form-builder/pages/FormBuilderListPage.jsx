import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiLink, FiCpu, FiFileText, FiCopy, FiSearch, FiInbox } from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import Card from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import CreateFormModal from '../components/CreateFormModal'
import { createEmptyForm, deleteForm, duplicateForm, getPublicFormUrl, listForms, listSubmissions, saveForm } from '../services/formStorage'
import toast from 'react-hot-toast'

export default function FormBuilderListPage() {
  const navigate = useNavigate()
  const [forms, setForms] = useState(() => listForms())
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')

  const refresh = () => setForms(listForms())

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return forms
    return forms.filter((f) => {
      const name = (f.formName || f.title || '').toLowerCase()
      return name.includes(q) || (f.description || '').toLowerCase().includes(q)
    })
  }, [forms, search])

  const stats = useMemo(() => ({
    total: forms.length,
    published: forms.filter((f) => f.status === 'published').length,
    draft: forms.filter((f) => f.status === 'draft').length,
    submissions: forms.reduce((sum, f) => sum + listSubmissions(f.id).length, 0),
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

  const handleDuplicate = (id, name) => {
    const copy = duplicateForm(id)
    if (!copy) {
      toast.error('Could not duplicate form')
      return
    }
    refresh()
    toast.success(`"${name}" duplicated`)
    navigate(`/form-builder/${copy.id}/edit`)
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <Card className="!p-4">
          <p className="text-sm text-muted-foreground">Total Responses</p>
          <p className="text-2xl font-bold text-brand-600">{stats.submissions}</p>
        </Card>
      </div>

      {forms.length > 0 ? (
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search forms..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
      ) : null}

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
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center text-sm text-muted-foreground">
          No forms match &quot;{search}&quot;
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((form) => {
            const displayName = form.formName || form.title || 'Untitled Form'
            const responseCount = listSubmissions(form.id).length
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
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {form.settings?.aiGenerated ? (
                  <span className="inline-flex items-center gap-1 text-brand-600">
                    <FiCpu className="h-3 w-3" /> AI generated
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1">
                  <FiInbox className="h-3 w-3" /> {responseCount} response{responseCount !== 1 ? 's' : ''}
                </span>
              </div>
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
                <button
                  type="button"
                  onClick={() => handleDuplicate(form.id, displayName)}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs hover:bg-muted"
                >
                  <FiCopy className="h-3.5 w-3.5" /> Duplicate
                </button>
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
