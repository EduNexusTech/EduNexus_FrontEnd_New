import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Feedback'
import { studentService } from '@/api/services'
import { STUDENT_STATUS_OPTIONS } from '@/config/constants'
import { SelectField } from '@/components/ui/Input'
import StudentBulkActions from '@/pages/students/StudentBulkActions'

const STATUS_LABELS = Object.fromEntries(STUDENT_STATUS_OPTIONS.map((o) => [o.value, o.label]))

export default function StudentList() {
  const [statusFilter, setStatusFilter] = useState('')
  const listParams = useMemo(() => (statusFilter ? { status: statusFilter } : {}), [statusFilter])

  const columns = [
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
    <ResourceListPage
      title="Student Roster"
      subtitle="Profiles, enrollments, and lifecycle — SIS source of truth"
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
          <Link to="/students"><Button variant="outline">SIS Hub</Button></Link>
          <StudentBulkActions />
        </>
      }
    />
  )
}
