import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiEdit2 } from 'react-icons/fi'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/Feedback'
import { getErrorMessage, unwrapData } from '@/api/client'

export function DetailRow({ label, value, fullWidth = false }) {
  return (
    <div
      className={`rounded-xl border border-border bg-slate-50/50 px-4 py-3 ${fullWidth ? 'sm:col-span-2' : ''}`}
    >
      <dt className="text-xs font-medium uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-text break-words">{value ?? '—'}</dd>
    </div>
  )
}

export function useListDetailModal() {
  const [viewId, setViewId] = useState(null)
  return {
    viewId,
    isOpen: Boolean(viewId),
    openView: (_item, id) => setViewId(id),
    closeView: () => setViewId(null),
  }
}

export default function ResourceDetailModal({
  recordId,
  open,
  onClose,
  queryKey,
  getFn,
  title = 'Details',
  getTitle,
  fields = [],
  editPath,
  size = 'lg',
  renderHeader,
  renderFooter,
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey, recordId],
    queryFn: () => getFn(recordId),
    enabled: open && Boolean(recordId),
  })

  const item = unwrapData(data)
  const modalTitle = item ? (getTitle ? getTitle(item) : title) : title

  const defaultFooter = item && editPath ? (
    <>
      <Button variant="secondary" onClick={onClose}>Close</Button>
      <Link to={editPath(item, recordId)} onClick={onClose}>
        <Button variant="outline">
          <FiEdit2 className="h-4 w-4" />
          Edit
        </Button>
      </Link>
    </>
  ) : (
    <Button variant="secondary" onClick={onClose}>Close</Button>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={modalTitle}
      size={size}
      footer={
        !isLoading && !error && item && renderFooter
          ? renderFooter(item, recordId, onClose)
          : defaultFooter
      }
    >
      {isLoading && (
        <div className="flex min-h-[200px] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <p className="py-8 text-center text-sm text-danger">{getErrorMessage(error)}</p>
      )}

      {!isLoading && !error && item && (
        <>
          {renderHeader?.(item)}
          <dl className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <DetailRow
                key={field.key}
                label={field.label}
                fullWidth={field.fullWidth}
                value={field.render ? field.render(item) : item[field.key]}
              />
            ))}
          </dl>
        </>
      )}
    </Modal>
  )
}
