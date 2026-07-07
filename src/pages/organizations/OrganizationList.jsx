import { useState } from 'react'
import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import { organizationService } from '@/api/services'
import OrganizationDetailModal from './OrganizationDetailModal'

const columns = [
  { accessorKey: 'organization_name', header: 'Name' },
  { accessorKey: 'organization_code', header: 'Code' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'city', header: 'City' },
  { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
]

export default function OrganizationList() {
  const [viewId, setViewId] = useState(null)

  return (
    <>
      <ResourceListPage
        title="Organizations"
        subtitle="Manage all organizations on the platform"
        queryKey="organizations"
        listFn={organizationService.list}
        deleteFn={organizationService.delete}
        basePath="/organizations"
        columns={columns}
        onView={(item) => setViewId(item.organization_id || item.id)}
      />

      <OrganizationDetailModal
        organizationId={viewId}
        open={Boolean(viewId)}
        onClose={() => setViewId(null)}
      />
    </>
  )
}
