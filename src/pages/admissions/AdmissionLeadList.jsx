import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ResourceListPage from '@/components/crud/ResourceListPage'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { admissionService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { LEAD_SOURCE_OPTIONS } from '@/config/constants'
import { resolveRecordId } from '@/utils/record'

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
}

const columns = [
  { accessorKey: 'student_name', header: 'Student' },
  { accessorKey: 'parent_name', header: 'Parent' },
  { accessorKey: 'mobile_number', header: 'Mobile' },
  { accessorKey: 'source', header: 'Source' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => STATUS_LABELS[getValue()] || getValue(),
  },
  { accessorKey: 'enquiry_date', header: 'Enquiry Date' },
]

export default function AdmissionLeadList({ embedded = false }) {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const listParams = useMemo(() => (statusFilter ? { status: statusFilter } : {}), [statusFilter])

  const convertMutation = useMutation({
    mutationFn: (id) => admissionService.leads.convert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-leads'] })
      queryClient.invalidateQueries({ queryKey: ['admission-applications'] })
      toast.success('Lead converted to application')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <ResourceListPage
      embedded={embedded}
      title="Admission Leads"
      subtitle="Enquiries and lead management with follow-ups"
      queryKey="admission-leads"
      listFn={admissionService.leads.list}
      listParams={listParams}
      deleteFn={admissionService.leads.delete}
      basePath="/admissions/leads"
      columns={[
        ...columns,
        {
          id: 'convert',
          header: 'Action',
          enableSorting: false,
          cell: ({ row }) => {
            const item = row.original
            if (item.status === 'converted') return <span className="text-xs text-muted">Converted</span>
            return (
              <Button
                size="sm"
                variant="outline"
                loading={convertMutation.isPending}
                onClick={() => convertMutation.mutate(resolveRecordId(item))}
              >
                Convert
              </Button>
            )
          },
        },
      ]}
      filters={
        <SelectField
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { label: 'All statuses', value: '' },
            ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value })),
          ]}
          className="min-w-[160px]"
        />
      }
    />
  )
}
