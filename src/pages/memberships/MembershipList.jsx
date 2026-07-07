import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import { membershipService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'
import { formatDateTime } from '@/utils/format'

const columns = [
  { accessorKey: 'user_email', header: 'User' },
  { accessorKey: 'organization_name', header: 'Organization' },
  { accessorKey: 'is_admin', header: 'Admin', cell: ({ getValue }) => (getValue() ? 'Yes' : 'No') },
  { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
]

const DETAIL_FIELDS = [
  { key: 'user_email', label: 'User' },
  { key: 'organization_name', label: 'Organization' },
  { key: 'is_admin', label: 'Organization Admin', render: (item) => (item.is_admin ? 'Yes' : 'No') },
  { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
  { key: 'joined_at', label: 'Joined', render: (item) => formatDateTime(item.joined_at) },
]

export default function MembershipList() {
  const { viewId, isOpen, openView, closeView } = useListDetailModal()

  return (
    <>
      <ResourceListPage
        title="Memberships"
        subtitle="Manage organization memberships"
        queryKey="memberships"
        listFn={membershipService.list}
        deleteFn={membershipService.delete}
        basePath="/memberships"
        columns={columns}
        onView={(item) => openView(item, resolveRecordId(item))}
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey="memberships"
        getFn={membershipService.get}
        getTitle={(item) => `${item.user_email} @ ${item.organization_name}`}
        fields={DETAIL_FIELDS}
        editPath={(item, id) => `/memberships/${item.id || id}/edit`}
      />
    </>
  )
}
