import { useState } from 'react'
import { FiUpload } from 'react-icons/fi'
import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import IconActionButton from '@/components/ui/IconActionButton'
import { schoolService } from '@/api/services'
import { resolveRecordId } from '@/utils/record'
import SchoolDocumentsModal, { SchoolDocumentsList } from './SchoolDocumentsModal'

const columns = [
  { accessorKey: 'school_name', header: 'Name' },
  { accessorKey: 'school_code', header: 'Code' },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'organization_name', header: 'Organization' },
  {
    accessorKey: 'documents_count',
    header: 'Docs',
    cell: ({ getValue }) => (
      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">
        {getValue() || 0}
      </span>
    ),
  },
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
  {
    key: 'documents',
    label: 'Documents',
    fullWidth: true,
    render: (item) => (
      <SchoolDocumentsList
        documents={item.documents || []}
        allowDownload
        emptyMessage="No documents uploaded for this school."
      />
    ),
  },
]

export default function SchoolList() {
  const { viewId, isOpen, openView, closeView } = useListDetailModal()
  const [uploadTarget, setUploadTarget] = useState(null)

  const listColumns = [
    ...columns,
    {
      id: 'upload',
      header: 'Upload',
      enableSorting: false,
      cell: ({ row }) => {
        const item = row.original
        const id = resolveRecordId(item) || item.school_id || item.id
        return (
          <IconActionButton
            variant="create"
            title="Upload documents"
            onClick={() => setUploadTarget({ id, name: item.school_name })}
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
        title="Schools"
        subtitle="Manage schools across organizations"
        queryKey="schools"
        listFn={schoolService.list}
        deleteFn={schoolService.delete}
        basePath="/schools"
        columns={listColumns}
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

      <SchoolDocumentsModal
        schoolId={uploadTarget?.id}
        schoolName={uploadTarget?.name}
        open={Boolean(uploadTarget)}
        onClose={() => setUploadTarget(null)}
      />
    </>
  )
}
