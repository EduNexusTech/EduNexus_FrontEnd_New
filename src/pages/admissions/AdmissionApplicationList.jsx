import { useMemo, useState } from 'react'
import ResourceListPage from '@/components/crud/ResourceListPage'
import { SelectField } from '@/components/ui/Input'
import { admissionService } from '@/api/services'
import { ADMISSION_STATUS_OPTIONS } from '@/config/constants'

const columns = [
  { accessorKey: 'admission_number', header: 'Adm. No.' },
  { accessorKey: 'full_name', header: 'Student' },
  { accessorKey: 'mobile_number', header: 'Mobile' },
  { accessorKey: 'applied_class_name', header: 'Class' },
  { accessorKey: 'status_display', header: 'Status' },
  { accessorKey: 'fee_paid', header: 'Fee Paid' },
  { accessorKey: 'application_date', header: 'Applied' },
]

export default function AdmissionApplicationList({ embedded = false }) {
  const [statusFilter, setStatusFilter] = useState('')
  const listParams = useMemo(() => (statusFilter ? { status: statusFilter } : {}), [statusFilter])

  return (
    <ResourceListPage
      embedded={embedded}
      title="Admission Applications"
      subtitle="Application form through enrollment pipeline"
      queryKey="admission-applications"
      listFn={admissionService.applications.list}
      listParams={listParams}
      deleteFn={admissionService.applications.delete}
      basePath="/admissions/applications"
      columns={columns}
      filters={
        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ label: 'All statuses', value: '' }, ...ADMISSION_STATUS_OPTIONS]}
          className="min-w-[180px]"
        />
      }
    />
  )
}
