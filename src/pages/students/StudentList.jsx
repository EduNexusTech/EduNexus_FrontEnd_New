import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ResourceListPage from '@/components/crud/ResourceListPage'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Feedback'
import Modal from '@/components/ui/Modal'
import { SelectField } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Feedback'
import { studentService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { STUDENT_STATUS_OPTIONS } from '@/config/constants'
import { downloadBlob } from '@/utils/format'
import { resolveMediaUrl } from '@/utils/format'

const STATUS_LABELS = Object.fromEntries(STUDENT_STATUS_OPTIONS.map((o) => [o.value, o.label]))

function BulkImportModal({ open, onClose }) {
  const queryClient = useQueryClient()
  const [jsonText, setJsonText] = useState('')
  const mutation = useMutation({
    mutationFn: (items) => studentService.bulkImport(items),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      const count = res?.data?.count ?? unwrapData(res)?.count ?? 'students'
      toast.success(`Imported ${count}`)
      onClose()
      setJsonText('')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonText)
      const items = Array.isArray(parsed) ? parsed : parsed.items
      if (!Array.isArray(items) || !items.length) {
        toast.error('Provide a JSON array or { "items": [...] }')
        return
      }
      mutation.mutate(items)
    } catch {
      toast.error('Invalid JSON')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bulk Import Students"
      size="lg"
      footer={
        <>
          <Button variant="cancel" onClick={onClose}>Cancel</Button>
          <Button variant="upload" loading={mutation.isPending} onClick={handleImport}>Import</Button>
        </>
      }
    >
      <p className="mb-3 text-sm text-muted">
        Paste JSON array. Each item: first_name, mobile_number or email, admission_number, roll_number (optional).
      </p>
      <textarea
        className="w-full min-h-[200px] rounded-xl border border-border p-3 font-mono text-xs"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder={'[\n  {"first_name":"Rahul","mobile_number":"9876543210","admission_number":"ADM001"}\n]'}
      />
    </Modal>
  )
}

export default function StudentList() {
  const [statusFilter, setStatusFilter] = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)
  const listParams = useMemo(() => (statusFilter ? { status: statusFilter } : {}), [statusFilter])

  const columns = [
    {
      id: 'photo',
      header: 'Photo',
      enableSorting: false,
      cell: ({ row }) => (
        <Avatar name={row.original.full_name} src={resolveMediaUrl(row.original.photo_url)} size="sm" />
      ),
    },
    { accessorKey: 'admission_number', header: 'Adm. No.' },
    { accessorKey: 'full_name', header: 'Name' },
    { accessorKey: 'roll_number', header: 'Roll No.' },
    { accessorKey: 'class_name', header: 'Class' },
    { accessorKey: 'section_name', header: 'Section' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <StatusBadge status={getValue()} label={STATUS_LABELS[getValue()] || getValue()} />,
    },
    { accessorKey: 'mobile_number', header: 'Mobile' },
  ]

  return (
    <>
      <ResourceListPage
        title="Students"
        subtitle="Student profiles, academic records, and lifecycle management"
        queryKey="students"
        listFn={studentService.list}
        listParams={listParams}
        deleteFn={studentService.delete}
        basePath="/students"
        columns={columns}
        filters={
          <SelectField
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ label: 'All statuses', value: '' }, ...STUDENT_STATUS_OPTIONS]}
            className="min-w-[160px]"
          />
        }
        extraActions={
          <>
            <Button variant="upload" onClick={() => setBulkOpen(true)}>Bulk Import</Button>
            <Button
              variant="excel"
              onClick={async () => {
                const blob = await studentService.export({})
                downloadBlob(blob, 'students-export.csv')
                toast.success('Export downloaded')
              }}
            >
              Export Excel
            </Button>
          </>
        }
      />
      <BulkImportModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </>
  )
}
