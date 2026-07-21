import ResourceListPage from '@/components/crud/ResourceListPage'
import { communicationService } from '@/api/services'
import { COMMUNICATION_STATUS_OPTIONS } from '@/config/constants'

const STATUS_LABELS = Object.fromEntries(COMMUNICATION_STATUS_OPTIONS.map((o) => [o.value, o.label]))

const columns = [
  { accessorKey: 'title', header: 'Title' },
  {
    accessorKey: 'audiences',
    header: 'Audience',
    cell: ({ getValue }) => (Array.isArray(getValue()) ? getValue().join(', ') : '—'),
  },
  {
    accessorKey: 'channels',
    header: 'Channels',
    cell: ({ getValue }) => (Array.isArray(getValue()) ? getValue().join(', ') : '—'),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => STATUS_LABELS[getValue()] || getValue(),
  },
  { accessorKey: 'sent_count', header: 'Sent' },
  { accessorKey: 'read_count', header: 'Read' },
  { accessorKey: 'scheduled_at', header: 'Scheduled' },
]

export default function AnnouncementsPage() {
  return (
    <ResourceListPage
      title="Announcements"
      subtitle="School-wide notices for students, parents, and staff — powered by the Communications engine"
      breadcrumb={[
        { label: 'Announcements', href: '/announcements' },
      ]}
      queryKey="announcements"
      listFn={communicationService.messages.list}
      listParams={{ category: 'announcement' }}
      deleteFn={communicationService.messages.delete}
      basePath="/communications/messages"
      createPath="/communications/messages/new?category=announcement"
      columns={columns}
    />
  )
}
