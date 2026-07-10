import { useMemo, useState } from 'react'
import ResourceListPage from '@/components/crud/ResourceListPage'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Feedback'
import toast from 'react-hot-toast'
import { staffService } from '@/api/services'
import { STAFF_ROLE_OPTIONS, STAFF_STATUS_OPTIONS } from '@/config/constants'
import { downloadBlob, resolveMediaUrl } from '@/utils/format'

const STATUS_LABELS = Object.fromEntries(STAFF_STATUS_OPTIONS.map((o) => [o.value, o.label]))
const ROLE_LABELS = Object.fromEntries(STAFF_ROLE_OPTIONS.map((o) => [o.value, o.label]))

export default function StaffList() {
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const listParams = useMemo(() => {
    const params = {}
    if (statusFilter) params.status = statusFilter
    if (roleFilter) params.staff_role_code = roleFilter
    return params
  }, [statusFilter, roleFilter])

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
    {
      accessorKey: 'staff_role_code',
      header: 'Role',
      cell: ({ getValue }) => ROLE_LABELS[getValue()] || getValue(),
    },
    { accessorKey: 'department_name', header: 'Department' },
    { accessorKey: 'designation_name', header: 'Designation' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => STATUS_LABELS[getValue()] || getValue(),
    },
    { accessorKey: 'mobile_number', header: 'Mobile' },
  ]

  return (
    <ResourceListPage
      title="Staff"
      subtitle="Non-teaching staff profiles, attendance, payroll, and credentials"
      queryKey="staff"
      listFn={staffService.list}
      listParams={listParams}
      deleteFn={staffService.delete}
      basePath="/staff"
      columns={columns}
      filters={
        <>
          <SelectField
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ label: 'All statuses', value: '' }, ...STAFF_STATUS_OPTIONS]}
            className="min-w-[160px]"
          />
          <SelectField
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[{ label: 'All roles', value: '' }, ...STAFF_ROLE_OPTIONS]}
            className="min-w-[160px]"
          />
        </>
      }
      extraActions={
        <Button
          variant="secondary"
          onClick={async () => {
            const blob = await staffService.export({})
            downloadBlob(blob, 'staff-export.csv')
            toast.success('Export downloaded')
          }}
        >
          Export CSV
        </Button>
      }
    />
  )
}
