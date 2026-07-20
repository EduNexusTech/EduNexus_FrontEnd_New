import { useMemo, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiUpload } from 'react-icons/fi'
import ResourceListPage from '@/components/crud/ResourceListPage'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import { ACADEMIC_DEFINITIONS } from '@/config/academicDefinitions'
import { academicServices, academicYearService, masterServices } from '@/api/services'
import { resolveRecordId } from '@/utils/record'
import { formatDateTime } from '@/utils/format'
import { getErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'

function resolveService(def) {
  if (def.scope === 'master' || def.masterKey) {
    return masterServices[def.serviceKey]
  }
  return academicServices[def.serviceKey]
}

function useAcademicYearLifecycle(enabled, queryKey) {
  const queryClient = useQueryClient()
  const [cloneOpen, setCloneOpen] = useState(false)
  const [cloneTarget, setCloneTarget] = useState(null)
  const [cloneForm, setCloneForm] = useState({ name: '', start_date: '', end_date: '' })

  const runAction = useMutation({
    mutationFn: async ({ action, id, payload }) => {
      if (action === 'clone') return academicYearService.clone(id, payload)
      return academicYearService[action](id)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      toast.success(
        vars.action === 'clone'
          ? 'Academic year cloned'
          : `Academic year ${vars.action.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
      )
      setCloneOpen(false)
      setCloneTarget(null)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const column = useMemo(() => {
    if (!enabled) return null
    return {
      id: 'lifecycle',
      header: 'Year Actions',
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original
        const id = resolveRecordId(item)
        const status = item.status || (item.is_current ? 'active' : 'draft')
        const busy = runAction.isPending
        return (
          <div className="flex flex-wrap gap-1">
            {!item.is_current && status !== 'archived' && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => runAction.mutate({ action: 'setCurrent', id })}>
                Set Current
              </Button>
            )}
            {status === 'active' && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => runAction.mutate({ action: 'freeze', id })}>
                Freeze
              </Button>
            )}
            {status === 'frozen' && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => runAction.mutate({ action: 'unfreeze', id })}>
                Unfreeze
              </Button>
            )}
            {(status === 'active' || status === 'frozen') && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => runAction.mutate({ action: 'close', id })}>
                Close
              </Button>
            )}
            {status === 'closed' && (
              <Button size="sm" variant="secondary" disabled={busy} onClick={() => runAction.mutate({ action: 'archive', id })}>
                Archive
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setCloneTarget(item)
                setCloneForm({
                  name: `${item.name || 'Year'} (Copy)`,
                  start_date: item.start_date || '',
                  end_date: item.end_date || '',
                })
                setCloneOpen(true)
              }}
            >
              Clone
            </Button>
          </div>
        )
      },
    }
  }, [enabled, runAction.isPending, runAction.mutate])

  const modal = enabled ? (
    <Modal open={cloneOpen} onClose={() => setCloneOpen(false)} title="Clone Academic Year" size="md">
      <div className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Name</span>
          <input
            className="w-full rounded-lg border border-border px-3 py-2"
            value={cloneForm.name}
            onChange={(e) => setCloneForm((f) => ({ ...f, name: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">Start Date</span>
          <input
            type="date"
            className="w-full rounded-lg border border-border px-3 py-2"
            value={cloneForm.start_date}
            onChange={(e) => setCloneForm((f) => ({ ...f, start_date: e.target.value }))}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-muted">End Date</span>
          <input
            type="date"
            className="w-full rounded-lg border border-border px-3 py-2"
            value={cloneForm.end_date}
            onChange={(e) => setCloneForm((f) => ({ ...f, end_date: e.target.value }))}
          />
        </label>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={() => setCloneOpen(false)}>Cancel</Button>
        <Button
          loading={runAction.isPending}
          onClick={() =>
            runAction.mutate({
              action: 'clone',
              id: resolveRecordId(cloneTarget),
              payload: cloneForm,
            })
          }
        >
          Clone Year
        </Button>
      </div>
    </Modal>
  ) : null

  return { column, modal }
}

function BulkUploadAction({ service, queryKey, sampleFields }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')

  const mutation = useMutation({
    mutationFn: (items) => service.bulkUpload(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      toast.success('Bulk upload completed')
      setOpen(false)
      setJsonText('')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleUpload = () => {
    try {
      const parsed = JSON.parse(jsonText)
      const items = Array.isArray(parsed) ? parsed : parsed.items
      if (!Array.isArray(items) || items.length === 0) {
        toast.error('Provide a JSON array or { "items": [...] }')
        return
      }
      mutation.mutate(items)
    } catch {
      toast.error('Invalid JSON')
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <FiUpload className="h-4 w-4" /> Bulk Upload
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Bulk Upload" size="lg">
        <p className="mb-3 text-sm text-muted">
          Paste a JSON array of records. Example fields: {sampleFields.join(', ')}
        </p>
        <textarea
          className="min-h-[220px] w-full rounded-xl border border-border p-3 font-mono text-xs"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={'[\n  { "school_id": "...", "academic_year_id": "...", "name": "Term 1", "code": "term_1" }\n]'}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button loading={mutation.isPending} onClick={handleUpload}>Upload</Button>
        </div>
      </Modal>
    </>
  )
}

export function AcademicList() {
  const { entityKey } = useParams()
  const def = ACADEMIC_DEFINITIONS[entityKey]
  const { viewId, isOpen, openView, closeView } = useListDetailModal()
  const queryKey = `academics-${entityKey || 'unknown'}`
  const { column: yearLifecycleColumn, modal: yearLifecycleModal } = useAcademicYearLifecycle(
    entityKey === 'academic-years',
    queryKey,
  )

  const columns = useMemo(() => {
    if (!def?.columns) return []
    if (!yearLifecycleColumn) return def.columns
    return [...def.columns, yearLifecycleColumn]
  }, [def?.columns, yearLifecycleColumn])

  if (!def) return <div className="p-8 text-center text-muted">Academic entity not found</div>
  if (def.masterKey) return <Navigate to={`/masters/${def.masterKey}`} replace />

  const service = resolveService(def)
  const sampleFields = def.fields?.filter((f) => f.required).map((f) => f.name).slice(0, 4) || ['name', 'code']

  const detailFields = [
    ...(def.fields || [])
      .filter((f) => f.type !== 'checkbox')
      .map((f) => ({ key: f.name, label: f.label, fullWidth: f.fullWidth })),
    ...(def.fields || [])
      .filter((f) => f.type === 'checkbox')
      .map((f) => ({
        key: f.name,
        label: f.label,
        render: (item) => (item[f.name] ? 'Yes' : 'No'),
      })),
    { key: 'created_at', label: 'Created', render: (item) => formatDateTime(item.created_at) },
  ]

  const extraActions = service.bulkUpload ? (
    <BulkUploadAction service={service} queryKey={queryKey} sampleFields={sampleFields} />
  ) : null

  return (
    <>
      <ResourceListPage
        title={def.labelPlural}
        subtitle={`Manage ${def.labelPlural.toLowerCase()}`}
        breadcrumb={[
          { label: 'Academic Foundation', href: '/academics' },
          { label: def.labelPlural },
        ]}
        queryKey={queryKey}
        listFn={service.list}
        deleteFn={service.delete}
        basePath={`/academics/${entityKey}`}
        columns={columns}
        onView={(item) => openView(item, resolveRecordId(item))}
        extraActions={extraActions}
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey={queryKey}
        getFn={service.get}
        getTitle={(item) => item.name || item.title || def.label}
        fields={detailFields}
        editPath={(_item, id) => `/academics/${entityKey}/${id}/edit`}
      />
      {yearLifecycleModal}
    </>
  )
}

export function AcademicForm() {
  const { entityKey } = useParams()
  const def = ACADEMIC_DEFINITIONS[entityKey]

  if (!def) return <div className="p-8 text-center text-muted">Academic entity not found</div>
  if (def.masterKey) return <Navigate to={`/masters/${def.masterKey}/new`} replace />

  const service = resolveService(def)

  return (
    <ResourceFormPage
      title={def.label}
      breadcrumb={[
        { label: 'Academic Foundation', href: '/academics' },
        { label: def.labelPlural, href: `/academics/${entityKey}` },
      ]}
      queryKey={`academics-${entityKey}`}
      getFn={service.get}
      createFn={service.create}
      updateFn={service.update}
      basePath={`/academics/${entityKey}`}
      fields={def.fields || []}
    />
  )
}
