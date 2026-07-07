import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import { userRoleService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'

const columns = [
  { accessorKey: 'user_email', header: 'User' },
  { accessorKey: 'role_name', header: 'Role' },
  { accessorKey: 'organization_name', header: 'Organization' },
  { accessorKey: 'school_name', header: 'School' },
  { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
]

const DETAIL_FIELDS = [
  { key: 'user_email', label: 'User' },
  { key: 'role_name', label: 'Role' },
  { key: 'organization_name', label: 'Organization' },
  { key: 'school_name', label: 'School' },
  { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
]

export default function UserRoleList() {
  const { viewId, isOpen, openView, closeView } = useListDetailModal()

  return (
    <>
      <ResourceListPage
        title="User Roles"
        subtitle="Assign roles to users"
        queryKey="user-roles"
        listFn={userRoleService.list}
        deleteFn={userRoleService.delete}
        basePath="/user-roles"
        columns={columns}
        onView={(item) => openView(item, resolveRecordId(item))}
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey="user-roles"
        getFn={userRoleService.get}
        getTitle={(item) => `${item.user_email} — ${item.role_name}`}
        fields={DETAIL_FIELDS}
        editPath={(item, id) => `/user-roles/${item.id || id}/edit`}
      />
    </>
  )
}
