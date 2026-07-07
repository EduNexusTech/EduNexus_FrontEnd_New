import { ResourceDetailPage } from '@/components/crud/ResourceFormPage'
import { auditLogService } from '@/api/services'
import { formatDateTime } from '@/utils/format'

export default function AuditLogDetail() {
  return (
    <ResourceDetailPage
      title="Audit Log"
      queryKey="audit-logs"
      getFn={auditLogService.get}
      basePath="/audit-logs"
      fields={[
        { key: 'user_name', label: 'User' },
        { key: 'user_email', label: 'Email' },
        { key: 'action', label: 'Action' },
        { key: 'table_name', label: 'Table' },
        { key: 'record_id', label: 'Record ID' },
        { key: 'ip_address', label: 'IP Address' },
        { key: 'timestamp', label: 'Timestamp', render: (item) => formatDateTime(item.timestamp) },
        { key: 'old_data', label: 'Old Data', render: (item) => <pre className="text-xs overflow-auto max-h-40 bg-slate-50 p-2 rounded">{JSON.stringify(item.old_data, null, 2)}</pre> },
        { key: 'new_data', label: 'New Data', render: (item) => <pre className="text-xs overflow-auto max-h-40 bg-slate-50 p-2 rounded">{JSON.stringify(item.new_data, null, 2)}</pre> },
      ]}
    />
  )
}
