import { ResourceDetailPage } from '@/components/crud/ResourceFormPage'
import AuditDataDiffTable from '@/components/audit/AuditDataDiffTable'
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
        {
          key: 'data_changes',
          label: 'Data changes',
          render: (item) => (
            <AuditDataDiffTable
              oldData={item.old_data ?? item.old_values ?? item.previous_data}
              newData={item.new_data ?? item.new_values ?? item.current_data}
            />
          ),
        },
      ]}
    />
  )
}
