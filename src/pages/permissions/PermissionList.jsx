import { Link } from 'react-router-dom'
import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import { permissionService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'
import Button from '@/components/ui/Button'

const columns = [
  { accessorKey: 'permission_name', header: 'Name' },
  { accessorKey: 'permission_code', header: 'Code' },
  { accessorKey: 'module', header: 'Module' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
]

const DETAIL_FIELDS = [
  { key: 'permission_name', label: 'Name' },
  { key: 'permission_code', label: 'Code' },
  { key: 'module', label: 'Module' },
  { key: 'description', label: 'Description', fullWidth: true },
  { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
]

export default function PermissionList() {
  const { viewId, isOpen, openView, closeView } = useListDetailModal()

  return (
    <>
      <ResourceListPage
        title="Permissions"
        subtitle="Manage system permissions"
        queryKey="permissions"
        listFn={permissionService.list}
        deleteFn={permissionService.delete}
        basePath="/permissions"
        columns={columns}
        onView={(item) => openView(item, resolveRecordId(item))}
        extraActions={
          <Link to="/permissions/matrix"><Button variant="secondary">Permission Matrix</Button></Link>
        }
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey="permissions"
        getFn={permissionService.get}
        getTitle={(item) => item.permission_name}
        fields={DETAIL_FIELDS}
        editPath={(item, id) => `/permissions/${item.permission_id || item.id || id}/edit`}
      />
    </>
  )
}
