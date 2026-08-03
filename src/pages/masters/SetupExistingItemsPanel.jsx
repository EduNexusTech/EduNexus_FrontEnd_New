import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'
import Modal from '@/components/ui/Modal'
import { getErrorMessage } from '@/api/client'
import { confirmDelete } from '@/utils/confirm'
import { resolveRecordId } from '@/utils/record'
import { cn } from '@/lib/utils'

function emptyForm() {
  return { name: '', sequence: '', is_active: true }
}

export default function SetupExistingItemsPanel({
  items,
  emptyLabel,
  isError,
  onRetry,
  entityLabel = 'item',
  service,
  queryKey,
  requestConfig,
}) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [selectedIds, setSelectedIds] = useState(() => new Set())

  const itemIds = useMemo(
    () => items.map((item) => String(resolveRecordId(item))).filter(Boolean),
    [items],
  )

  useEffect(() => {
    setSelectedIds((prev) => {
      const valid = new Set(itemIds)
      const next = new Set([...prev].filter((id) => valid.has(id)))
      return next.size === prev.size ? prev : next
    })
  }, [itemIds])

  const allSelected = itemIds.length > 0 && itemIds.every((id) => selectedIds.has(id))
  const someSelected = selectedIds.size > 0

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => service.update(id, data, requestConfig),
    onSuccess: () => {
      invalidate()
      toast.success(`${entityLabel} updated`)
      closeEdit()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => service.delete(id, requestConfig),
    onSuccess: () => {
      invalidate()
      toast.success(`${entityLabel} deleted`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      const results = await Promise.allSettled(
        ids.map((id) => service.delete(id, requestConfig)),
      )
      const errors = results
        .filter((result) => result.status === 'rejected')
        .map((result) => result.reason)
      return { total: ids.length, failed: errors.length, errors }
    },
    onSuccess: ({ total, failed, errors }) => {
      invalidate()
      setSelectedIds(new Set())
      if (failed > 0) {
        const detail = errors?.[0] ? getErrorMessage(errors[0]) : ''
        toast.error(
          `${failed} of ${total} could not be deleted${detail ? `: ${detail}` : ''}`,
        )
        return
      }
      toast.success(`${total} ${entityLabel.toLowerCase()}${total === 1 ? '' : 's'} deleted`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const closeEdit = () => {
    setEditing(null)
    setForm(emptyForm())
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name || '',
      sequence: item.sequence ?? '',
      is_active: item.is_active !== false,
    })
  }

  const toggleSelect = (id) => {
    const key = String(id)
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(itemIds))
  }

  const handleSave = () => {
    const id = resolveRecordId(editing)
    if (!id) return
    const name = form.name.trim()
    if (!name) {
      toast.error('Name is required')
      return
    }
    const payload = {
      name,
      sequence: Number(form.sequence) || 0,
      is_active: Boolean(form.is_active),
    }
    updateMutation.mutate({ id, data: payload })
  }

  const handleDelete = async (item) => {
    const id = resolveRecordId(item)
    if (!id) return
    const label = item.name || item.code || entityLabel
    const ok = await confirmDelete(`"${label}"`)
    if (!ok) return
    deleteMutation.mutate(id)
  }

  const handleBulkDelete = async () => {
    const ids = [...selectedIds]
    if (!ids.length) return
    const ok = await confirmDelete(`${ids.length} selected ${entityLabel.toLowerCase()}${ids.length === 1 ? '' : 's'}`)
    if (!ok) return
    bulkDeleteMutation.mutate(ids)
  }

  const deleteBusy = deleteMutation.isPending || bulkDeleteMutation.isPending

  if (isError) {
    return (
      <div className="mt-4 rounded-lg border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
        <p>{emptyLabel}</p>
        {onRetry ? (
          <button
            type="button"
            className="mt-2 text-xs font-semibold text-primary underline"
            onClick={onRetry}
          >
            Retry
          </button>
        ) : null}
      </div>
    )
  }

  if (!items.length) {
    return <p className="mt-4 text-sm text-muted">{emptyLabel}</p>
  }

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
          <p className="text-xs font-semibold uppercase text-muted">Existing ({items.length})</p>
          <div className="flex flex-wrap items-center gap-2">
            {someSelected ? (
              <Button
                variant="danger"
                size="sm"
                loading={bulkDeleteMutation.isPending}
                onClick={handleBulkDelete}
              >
                <FiTrash2 className="h-4 w-4" />
                Delete ({selectedIds.size})
              </Button>
            ) : null}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted">
              <tr>
                <th className="w-10 px-3 py-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={allSelected}
                    aria-label="Select all"
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-3 py-2 text-left font-semibold">Name</th>
                <th className="px-3 py-2 text-left font-semibold">Code</th>
                <th className="px-3 py-2 text-left font-semibold">Seq</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
                <th className="px-3 py-2 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const id = String(resolveRecordId(item))
                const inactive = item.is_active === false
                const selected = selectedIds.has(id)
                return (
                  <tr
                    key={id}
                    className={cn(
                      'border-t border-border',
                      inactive && 'opacity-60',
                      selected && 'bg-primary/5',
                    )}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border"
                        checked={selected}
                        aria-label={`Select ${item.name || item.code}`}
                        onChange={() => toggleSelect(id)}
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2 text-muted">{item.code}</td>
                    <td className="px-3 py-2 text-muted">{item.sequence ?? '—'}</td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          inactive
                            ? 'bg-muted text-muted-foreground'
                            : 'bg-success/10 text-success',
                        )}
                      >
                        {inactive ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="rounded-lg p-2 text-muted hover:bg-muted hover:text-foreground"
                          title={`Edit ${entityLabel}`}
                          onClick={() => openEdit(item)}
                        >
                          <FiEdit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className="rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger"
                          title={`Delete ${entityLabel}`}
                          disabled={deleteBusy}
                          onClick={() => handleDelete(item)}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={closeEdit}
        title={`Edit ${entityLabel}`}
        footer={
          <>
            <Button variant="secondary" onClick={closeEdit}>
              Cancel
            </Button>
            <Button variant="create" loading={updateMutation.isPending} onClick={handleSave}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Code" value={editing?.code || ''} disabled />
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Sequence"
            type="number"
            value={form.sequence}
            onChange={(e) => setForm((prev) => ({ ...prev, sequence: e.target.value }))}
          />
          <Checkbox
            label="Active"
            checked={form.is_active}
            onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
          />
        </div>
      </Modal>
    </>
  )
}
