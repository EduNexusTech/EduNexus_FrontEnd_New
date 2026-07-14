import { Link } from 'react-router-dom'
import { FiEdit2, FiShield } from 'react-icons/fi'
import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import Button from '@/components/ui/Button'
import { roleService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'

const columns = [
  { accessorKey: 'role_name', header: 'Role Name' },
  { accessorKey: 'role_code', header: 'Code' },
  { accessorKey: 'description', header: 'Description' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'is_active', header: 'Active', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
]

const DETAIL_FIELDS = [
  { key: 'role_name', label: 'Role Name' },
  { key: 'role_code', label: 'Code' },
  { key: 'description', label: 'Description', fullWidth: true },
  { key: 'status', label: 'Status' },
  { key: 'is_system', label: 'System Role', render: (item) => (item.is_system ? 'Yes' : 'No') },
  { key: 'is_active', label: 'Active', render: (item) => <StatusBadge active={item.is_active} /> },
]

export default function RoleList() {
  const { viewId, isOpen, openView, closeView } = useListDetailModal()

  return (
    <>
      <ResourceListPage
        title="Roles"
        subtitle="Manage roles and access control"
        queryKey="roles"
        listFn={roleService.list}
        deleteFn={roleService.delete}
        basePath="/roles"
        columns={columns}
        onView={(item) => openView(item, resolveRecordId(item))}
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey="roles"
        getFn={roleService.get}
        getTitle={(item) => item.role_name}
        fields={DETAIL_FIELDS}
        renderFooter={(item, recordId, close) => {
          const roleId = item.role_id || item.id || recordId
          return (
            <>
              <Button variant="cancel" onClick={close}>Close</Button>
              <Link to={`/roles/${roleId}/edit`} onClick={close}>
                <Button variant="edit"><FiEdit2 className="h-4 w-4" /> Edit</Button>
              </Link>
              <Link to={`/roles/${roleId}/permissions`} onClick={close}>
                <Button variant="secondary"><FiShield className="h-4 w-4" /> Permissions</Button>
              </Link>
            </>
          )
        }}
      />
    </>
  )
}
