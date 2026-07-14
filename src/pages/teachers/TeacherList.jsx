import { useMemo, useState } from 'react'
import ResourceListPage from '@/components/crud/ResourceListPage'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'
import { teacherService } from '@/api/services'
import { TEACHER_STATUS_OPTIONS } from '@/config/constants'
import { downloadBlob, resolveMediaUrl } from '@/utils/format'

const STATUS_LABELS = Object.fromEntries(TEACHER_STATUS_OPTIONS.map((o) => [o.value, o.label]))

export default function TeacherList() {
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
    { accessorKey: 'employee_id', header: 'Employee ID' },
    { accessorKey: 'full_name', header: 'Name' },
    { accessorKey: 'designation', header: 'Designation' },
    { accessorKey: 'department', header: 'Department' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => STATUS_LABELS[getValue()] || getValue(),
    },
    { accessorKey: 'subjects_count', header: 'Subjects' },
    { accessorKey: 'mobile_number', header: 'Mobile' },
  ]

  return (
    <ResourceListPage
      title="Teachers"
      subtitle="Teacher profiles, assignments, attendance, and academic activities"
      queryKey="teachers"
      listFn={teacherService.list}
      listParams={listParams}
      deleteFn={teacherService.delete}
      basePath="/teachers"
      columns={columns}
      filters={
        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ label: 'All statuses', value: '' }, ...TEACHER_STATUS_OPTIONS]}
          className="min-w-[160px]"
        />
      }
      extraActions={
        <Button
          variant="excel"
          onClick={async () => {
            const blob = await teacherService.export({})
            downloadBlob(blob, 'teachers-export.csv')
            toast.success('Export downloaded')
          }}
        >
          Export Excel
        </Button>
      }
    />
  )
}
