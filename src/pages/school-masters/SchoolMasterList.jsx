import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiDownload, FiUpload } from 'react-icons/fi'
import ResourceListPage from '@/components/crud/ResourceListPage'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { schoolMasterService } from '@/api/services'
import { SCHOOL_MASTER_DEFINITIONS } from '@/config/schoolMasterDefinitions'
import { getErrorMessage } from '@/api/client'
import { downloadBlob } from '@/utils/format'

function BulkImportAction({ masterKey, service, queryKey }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [jsonText, setJsonText] = useState('')

  const mutation = useMutation({
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
      mutation.mutate(items)
    } catch {
      toast.error('Invalid JSON')
    }
  }

  return (
    <>
      <Button variant="upload" onClick={() => setOpen(true)}>
        <FiUpload className="h-4 w-4" /> Bulk Import
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Bulk Import" size="lg">
        <p className="mb-3 text-sm text-muted">
          Paste JSON array for <strong>{masterKey}</strong>. Fields: name, code, description, sequence, is_active, parent_code
        </p>
        <textarea
          className="min-h-[220px] w-full rounded-xl border border-border p-3 font-mono text-xs"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={'[\n  { "name": "Male", "code": "male", "sequence": 1, "is_active": true }\n]'}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="cancel" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="upload" loading={mutation.isPending} onClick={handleImport}>Import</Button>
        </div>
      </Modal>
    </>
  )
}

export default function SchoolMasterList() {
  const { masterKey } = useParams()
  const def = SCHOOL_MASTER_DEFINITIONS[masterKey]
  const service = useMemo(() => schoolMasterService.forType(masterKey), [masterKey])

  if (!def) {
    return <div className="p-8 text-center text-muted">School master type not found</div>
  }

  return (
    <ResourceListPage
      title={def.labelPlural}
      subtitle={`School-configurable ${def.labelPlural.toLowerCase()}`}
      breadcrumb={[
        { label: 'School Masters', href: '/school-masters' },
        { label: def.labelPlural },
      ]}
      queryKey={`school-masters-${masterKey}`}
      listFn={service.list}
      deleteFn={service.delete}
      basePath={`/school-masters/${masterKey}`}
      columns={def.columns}
      extraActions={
        <>
          <BulkImportAction masterKey={masterKey} service={service} queryKey={`school-masters-${masterKey}`} />
          <Button
            variant="excel"
            onClick={async () => {
              const blob = await service.export({})
              downloadBlob(blob, `school-masters-${masterKey}.csv`)
              toast.success('Export downloaded')
            }}
          >
            <FiDownload className="h-4 w-4" /> Export Excel
          </Button>
        </>
      }
    />
  )
}
