import { useMemo, useState } from 'react'
import ResourceListPage from '@/components/crud/ResourceListPage'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'
import { parentService } from '@/api/services'
import { PARENT_STATUS_OPTIONS } from '@/config/constants'
import { downloadBlob, resolveMediaUrl } from '@/utils/format'

const STATUS_LABELS = Object.fromEntries(PARENT_STATUS_OPTIONS.map((o) => [o.value, o.label]))

export default function ParentList() {
  const [statusFilter, setStatusFilter] = useState('')
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
    { accessorKey: 'parent_code', header: 'Parent Code' },
    { accessorKey: 'full_name', header: 'Name' },
    { accessorKey: 'occupation', header: 'Occupation' },
    { accessorKey: 'education', header: 'Education' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => STATUS_LABELS[getValue()] || getValue(),
    },
    { accessorKey: 'linked_students_count', header: 'Students' },
    { accessorKey: 'mobile_number', header: 'Mobile' },
  ]

  return (
    <ResourceListPage
      title="Parents"
      subtitle="Parent profiles, linked students, and portal access"
      queryKey="parents"
      listFn={parentService.list}
      listParams={listParams}
      deleteFn={parentService.delete}
      basePath="/parents"
      columns={columns}
      filters={
        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ label: 'All statuses', value: '' }, ...PARENT_STATUS_OPTIONS]}
          className="min-w-[160px]"
        />
      }
      extraActions={
        <Button
          variant="excel"
          onClick={async () => {
            const blob = await parentService.export({})
            downloadBlob(blob, 'parents-export.csv')
            toast.success('Export downloaded')
          }}
        >
          Export Excel
        </Button>
      }
    />
  )
}
