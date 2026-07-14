import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiDownload, FiUpload } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { getErrorMessage } from '@/api/client'
import { downloadBlob } from '@/utils/format'

export default function MasterBulkActions({ masterKey, service, queryKey }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')

  const importMut = useMutation({
    mutationFn: (items) => service.bulkImport(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      toast.success('Bulk import completed')
      setOpen(false)
      setJsonText('')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText)
      const items = Array.isArray(parsed) ? parsed : parsed.items
      if (!Array.isArray(items) || items.length === 0) {
        toast.error('Provide a JSON array or { "items": [...] }')
        return
      }
      importMut.mutate(items)
    } catch {
      toast.error('Invalid JSON')
    }
  }

  if (!service.bulkImport && !service.export) return null

  return (
    <>
      {service.bulkImport && (
        <Button variant="upload" onClick={() => setOpen(true)}>
          <FiUpload className="h-4 w-4" /> Bulk Import
        </Button>
      )}
      {service.export && (
        <Button
          variant="excel"
          onClick={async () => {
            const blob = await service.export({})
            downloadBlob(blob, `${masterKey}-export.csv`)
            toast.success('Export downloaded')
          }}
        >
          <FiDownload className="h-4 w-4" /> Export Excel
        </Button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Bulk Import" size="lg">
        <p className="mb-3 text-sm text-muted">
          Paste JSON for <strong>{masterKey}</strong>. Fields: name, code, description, sequence, is_active
        </p>
        <textarea
          className="min-h-[220px] w-full rounded-xl border border-border p-3 font-mono text-xs"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="cancel" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="upload" loading={importMut.isPending} onClick={handleImport}>Import</Button>
        </div>
      </Modal>
    </>
  )
}
