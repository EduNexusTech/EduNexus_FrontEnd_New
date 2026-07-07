import ResourceListPage from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import { auditLogService } from '@/api/services'
import { formatDateTime } from '@/utils/format'
import { resolveRecordId } from '@/utils/record'

const columns = [
  { accessorKey: 'user_name', header: 'User' },
  { accessorKey: 'action', header: 'Action' },
  { accessorKey: 'table_name', header: 'Table' },
  { accessorKey: 'record_id', header: 'Record ID' },
  { accessorKey: 'ip_address', header: 'IP Address' },
  { accessorKey: 'timestamp', header: 'Timestamp', cell: ({ getValue }) => formatDateTime(getValue()) },
]

const DETAIL_FIELDS = [
  { key: 'user_name', label: 'User' },
  { key: 'user_email', label: 'Email' },
  { key: 'action', label: 'Action' },
  { key: 'table_name', label: 'Table' },
  { key: 'record_id', label: 'Record ID' },
  { key: 'ip_address', label: 'IP Address' },
  { key: 'timestamp', label: 'Timestamp', render: (item) => formatDateTime(item.timestamp) },
  {
    key: 'old_data',
    label: 'Old Data',
    fullWidth: true,
    render: (item) => (
      <pre className="max-h-40 overflow-auto rounded bg-white p-2 text-xs font-normal text-text">
        {JSON.stringify(item.old_data, null, 2)}
      </pre>
    ),
  },
  {
    key: 'new_data',
    label: 'New Data',
    fullWidth: true,
    render: (item) => (
      <pre className="max-h-40 overflow-auto rounded bg-white p-2 text-xs font-normal text-text">
        {JSON.stringify(item.new_data, null, 2)}
      </pre>
    ),
  },
]

export default function AuditLogList() {
  const { viewId, isOpen, openView, closeView } = useListDetailModal()

  return (
    <>
      <ResourceListPage
        title="Audit Logs"
        subtitle="System activity and change history"
        queryKey="audit-logs"
        listFn={auditLogService.list}
        deleteFn={null}
        basePath="/audit-logs"
        columns={columns}
        onView={(item) => openView(item, resolveRecordId(item))}
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey="audit-logs"
        getFn={auditLogService.get}
        getTitle={(item) => `${item.action} — ${item.table_name}`}
        fields={DETAIL_FIELDS}
        size="xl"
      />
    </>
  )
}
