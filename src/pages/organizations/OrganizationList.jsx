import { useState } from 'react'
import { FiUpload } from 'react-icons/fi'
import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import IconActionButton from '@/components/ui/IconActionButton'
import { organizationService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'
import OrganizationDetailModal from './OrganizationDetailModal'
import OrganizationDocumentsModal from './OrganizationDocumentsModal'

export default function OrganizationList() {
  const [viewId, setViewId] = useState(null)
  const [uploadTarget, setUploadTarget] = useState(null)

  const columns = [
    { accessorKey: 'organization_name', header: 'Name' },
    { accessorKey: 'organization_code', header: 'Code' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'city', header: 'City' },
    {
      accessorKey: 'documents_count',
      header: 'Docs',
      cell: ({ getValue }) => (
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">
          {getValue() || 0}
        </span>
      ),
    },
    { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
    {
      id: 'upload',
      header: 'Upload',
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original
        const id = resolveRecordId(item) || item.organization_id || item.id
        return (
          <IconActionButton
            variant="create"
            title="Upload documents"
            onClick={() => setUploadTarget({ id, name: item.organization_name })}
          >
            <FiUpload className="h-4 w-4" />
          </IconActionButton>
        )
      },
    },
  ]

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

      <OrganizationDocumentsModal
        organizationId={uploadTarget?.id}
        organizationName={uploadTarget?.name}
        open={Boolean(uploadTarget)}
        onClose={() => setUploadTarget(null)}
      />
    </>
  )
}
