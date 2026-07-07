import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import ResourceListPage from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import Button from '@/components/ui/Button'
import { notificationService } from '@/api/services'
import { fromNow, formatDateTime } from '@/utils/format'
import { resolveRecordId } from '@/utils/record'

const columns = [
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'message', header: 'Message' },
  { accessorKey: 'notification_type', header: 'Type' },
  { accessorKey: 'is_read', header: 'Read', cell: ({ getValue }) => (getValue() ? 'Yes' : 'No') },
  { accessorKey: 'created_at', header: 'Time', cell: ({ getValue }) => fromNow(getValue()) },
]

const DETAIL_FIELDS = [
  { key: 'title', label: 'Title' },
  { key: 'notification_type', label: 'Type' },
  { key: 'is_read', label: 'Read', render: (item) => (item.is_read ? 'Yes' : 'No') },
  { key: 'created_at', label: 'Created', render: (item) => formatDateTime(item.created_at) },
  { key: 'message', label: 'Message', fullWidth: true },
]

function NotificationDetailModal({ notificationId, open, onClose }) {
  const queryClient = useQueryClient()

  const markReadMutation = useMutation({
    mutationFn: () => notificationService.markRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Marked as read')
    },
    onError: () => toast.error('Failed to mark as read'),
  })

  return (
    <ResourceDetailModal
      recordId={notificationId}
      open={open}
      onClose={onClose}
      queryKey="notifications"
      getFn={notificationService.get}
      getTitle={(item) => item.title}
      fields={DETAIL_FIELDS}
      renderFooter={(item, _id, close) => (
        <>
          <Button variant="secondary" onClick={close}>Close</Button>
          {!item.is_read && (
            <Button loading={markReadMutation.isPending} onClick={() => markReadMutation.mutate()}>
              Mark as Read
            </Button>
          )}
        </>
      )}
    />
  )
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { viewId, isOpen, openView, closeView } = useListDetailModal()

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All marked as read')
    },
  })

  return (
    <>
      <ResourceListPage
        title="Notifications"
        subtitle="Your notification history"
        queryKey="notifications"
        listFn={notificationService.list}
        deleteFn={null}
        basePath="/notifications"
        columns={columns}
        onView={(item) => openView(item, resolveRecordId(item))}
        extraActions={
          <Button variant="secondary" onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending}>
            Mark All Read
          </Button>
        }
      />

      <NotificationDetailModal notificationId={viewId} open={isOpen} onClose={closeView} />
    </>
  )
}
