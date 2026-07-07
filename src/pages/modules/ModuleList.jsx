import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import { moduleService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'

const columns = [
  { accessorKey: 'module_name', header: 'Module Name' },
  { accessorKey: 'module_code', header: 'Code' },
  { accessorKey: 'icon', header: 'Icon' },
  { accessorKey: 'sequence', header: 'Order' },
  { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
]

const DETAIL_FIELDS = [
  { key: 'module_name', label: 'Module Name' },
  { key: 'module_code', label: 'Code' },
  { key: 'icon', label: 'Icon' },
  { key: 'sequence', label: 'Order' },
  { key: 'description', label: 'Description', fullWidth: true },
  { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
]

export default function ModuleList() {
  const { viewId, isOpen, openView, closeView } = useListDetailModal()

  return (
    <>
      <ResourceListPage
        title="Modules"
        subtitle="Manage navigation modules"
        queryKey="modules"
        listFn={moduleService.list}
        deleteFn={moduleService.delete}
        basePath="/modules"
        columns={columns}
        onView={(item) => openView(item, resolveRecordId(item))}
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey="modules"
        getFn={moduleService.get}
        getTitle={(item) => item.module_name}
        fields={DETAIL_FIELDS}
        editPath={(item, id) => `/modules/${item.module_id || item.id || id}/edit`}
      />
    </>
  )
}
