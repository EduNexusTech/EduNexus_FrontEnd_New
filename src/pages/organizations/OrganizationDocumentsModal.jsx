import { useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiDownload,
  FiFile,
  FiFileText,
  FiTrash2,
  FiUpload,
  FiUploadCloud,
  FiX,
} from 'react-icons/fi'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Feedback'
import { organizationService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { cn, formatDateTime, resolveMediaUrl } from '@/utils/format'
import { confirmDialog } from '@/utils/confirm'

export const ORG_DOCUMENT_TYPE_OPTIONS = [
  { label: 'Agreement', value: 'agreement' },
  { label: 'Registration', value: 'registration' },
  { label: 'Tax Document', value: 'tax' },
  { label: 'License', value: 'license' },
  { label: 'Identity Proof', value: 'identity' },
  { label: 'Gallery', value: 'gallery' },
  { label: 'Other', value: 'other' },
]

function formatBytes(bytes = 0) {
  const size = Number(bytes) || 0
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function getDocumentName(doc) {
  return doc?.title || doc?.file_name || 'Document'
}

function getDocumentUrl(doc) {
  return resolveMediaUrl(doc?.file_url || doc?.file)
}

export function OrganizationDocumentsList({
  documents = [],
  allowDownload = true,
  allowDelete = false,
  onDelete,
  deletingId = null,
  emptyMessage = 'No documents uploaded yet.',
}) {
  if (!documents.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-slate-50/70 px-4 py-8 text-center">
        <FiFileText className="mx-auto h-8 w-8 text-muted/70" />
        <p className="mt-2 text-sm text-muted">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {documents.map((doc) => {
        const url = getDocumentUrl(doc)
        const id = doc.document_id || doc.id
        return (
          <li
            key={id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-white px-3 py-3 shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FiFile className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text">{getDocumentName(doc)}</p>
              <p className="mt-0.5 text-xs text-muted">
                {doc.document_type_display || doc.document_type || 'Document'}
                {doc.file_size ? ` · ${formatBytes(doc.file_size)}` : ''}
                {doc.created_at ? ` · ${formatDateTime(doc.created_at)}` : ''}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {allowDownload && url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-primary transition hover:bg-primary/5"
                  title="Download"
                >
                  <FiDownload className="h-4 w-4" />
                </a>
              )}
              {allowDelete && (
                <button
                  type="button"
                  onClick={() => onDelete?.(doc)}
                  disabled={deletingId === id}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                  title="Delete"
                >
                  <FiTrash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function OrganizationDocumentsUploader({
  organizationId,
  onUploaded,
  className,
  compact = false,
}) {
  const inputRef = useRef(null)
  const [files, setFiles] = useState([])
  const [documentType, setDocumentType] = useState('other')
  const [dragOver, setDragOver] = useState(false)

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData()
      files.forEach((file) => fd.append('files', file))
      fd.append('document_type', documentType)
      return organizationService.uploadDocuments(organizationId, fd)
    },
    onSuccess: (response) => {
      toast.success(response?.message || 'Documents uploaded')
      setFiles([])
      onUploaded?.(response)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const addFiles = (incoming) => {
    const next = Array.from(incoming || [])
    if (!next.length) return
    setFiles((prev) => {
      const names = new Set(prev.map((f) => `${f.name}-${f.size}`))
      const unique = next.filter((f) => !names.has(`${f.name}-${f.size}`))
      return [...prev, ...unique]
    })
  }

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-4', className)}>
      <SelectField
        label="Document Type"
        value={documentType}
        onChange={(e) => setDocumentType(e.target.value)}
        options={ORG_DOCUMENT_TYPE_OPTIONS}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          addFiles(e.dataTransfer.files)
        }}
        className={cn(
          'rounded-2xl border-2 border-dashed px-4 py-8 text-center transition',
          dragOver ? 'border-primary bg-primary/5' : 'border-border bg-slate-50/80',
          compact && 'py-6',
        )}
      >
        <FiUploadCloud className="mx-auto h-9 w-9 text-primary" />
        <p className="mt-3 text-sm font-medium text-text">Drag & drop files here</p>
        <p className="mt-1 text-xs text-muted">PDF, Word, Excel, images — multiple files supported</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
          <FiUpload className="h-4 w-4" /> Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="max-h-48 space-y-2 overflow-y-auto">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2"
            >
              <FiFile className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text">{file.name}</p>
                <p className="text-xs text-muted">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-text"
              >
                <FiX className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          disabled={!files.length}
          loading={uploadMutation.isPending}
          onClick={() => uploadMutation.mutate()}
        >
          <FiUpload className="h-4 w-4" />
          Upload {files.length ? `(${files.length})` : ''}
        </Button>
      </div>
    </div>
  )
}

export default function OrganizationDocumentsModal({
  organizationId,
  organizationName,
  open,
  onClose,
}) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['organizations', organizationId, 'documents-modal'],
    queryFn: () => organizationService.get(organizationId),
    enabled: open && Boolean(organizationId),
  })

  const organization = unwrapData(data)
  const documents = useMemo(() => organization?.documents || [], [organization])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Documents"
      size="lg"
      footer={
        <Button variant="cancel" onClick={onClose}>Close</Button>
      }
    >
      <div className="mb-5">
        <p className="text-sm text-muted">
          Upload multiple documents for{' '}
          <span className="font-semibold text-text">{organizationName || organization?.organization_name || 'organization'}</span>.
        </p>
      </div>

      {isLoading ? (
        <div className="flex min-h-[160px] items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <p className="py-6 text-center text-sm text-danger">{getErrorMessage(error)}</p>
      ) : (
        <div className="space-y-6">
          <OrganizationDocumentsUploader
            organizationId={organizationId}
            onUploaded={() => {
              queryClient.invalidateQueries({ queryKey: ['organizations'] })
              refetch()
            }}
          />

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Existing documents</h3>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">
                {documents.length}
              </span>
            </div>
            <OrganizationDocumentsList documents={documents} allowDownload />
          </div>
        </div>
      )}
    </Modal>
  )
}

export function useOrganizationDocumentDelete(organizationId, invalidateKeys = ['organizations']) {
  const queryClient = useQueryClient()
  const [deletingId, setDeletingId] = useState(null)

  const mutation = useMutation({
    mutationFn: (documentId) => organizationService.deleteDocument(organizationId, documentId),
    onSuccess: () => {
      toast.success('Document deleted')
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key] })
      })
    },
    onError: (error) => toast.error(getErrorMessage(error)),
    onSettled: () => setDeletingId(null),
  })

  const deleteDocument = async (doc) => {
    const id = doc.document_id || doc.id
    const confirmed = await confirmDialog({
      title: 'Delete document?',
      text: `"${getDocumentName(doc)}" will be removed from this organization.`,
      confirmButtonText: 'Delete',
      icon: 'warning',
    })
    if (!confirmed) return
    setDeletingId(id)
    mutation.mutate(id)
  }

  return { deleteDocument, deletingId, isDeleting: mutation.isPending }
}
