import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import { schoolService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'

const columns = [
  { accessorKey: 'school_name', header: 'Name' },
  { accessorKey: 'school_code', header: 'Code' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'organization_name', header: 'Organization' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'is_active', header: 'Active', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
]

const DETAIL_FIELDS = [
  { key: 'school_name', label: 'Name' },
  { key: 'school_code', label: 'Code' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'website', label: 'Website' },
  { key: 'organization_name', label: 'Organization' },
  { key: 'address', label: 'Address', fullWidth: true },
  { key: 'timezone', label: 'Timezone' },
  { key: 'currency', label: 'Currency' },
  { key: 'status', label: 'Status' },
  { key: 'is_active', label: 'Active', render: (item) => <StatusBadge active={item.is_active} /> },
]

export default function SchoolList() {
  const { viewId, isOpen, openView, closeView } = useListDetailModal()

  return (
    <>
      <ResourceListPage
        title="Schools"
        subtitle="Manage schools across organizations"
        queryKey="schools"
        listFn={schoolService.list}
        deleteFn={schoolService.delete}
        basePath="/schools"
        columns={columns}
        onView={(item) => openView(item, resolveRecordId(item))}
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey="schools"
        getFn={schoolService.get}
        getTitle={(item) => item.school_name}
        fields={DETAIL_FIELDS}
        editPath={(_item, id) => `/schools/${id}/edit`}
      />
    </>
  )
}
