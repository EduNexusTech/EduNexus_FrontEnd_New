import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiEdit2 } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Feedback'
import ResourceDetailModal from '@/components/crud/ResourceDetailModal'
import { organizationService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { formatDateTime, resolveMediaUrl } from '@/utils/format'
import { OrganizationDocumentsList } from './OrganizationDocumentsModal'

const DETAIL_FIELDS = [
  { key: 'organization_name', label: 'Name' },
  { key: 'organization_code', label: 'Code' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'website', label: 'Website' },
  { key: 'address', label: 'Address', fullWidth: true },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'country', label: 'Country' },
  { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
  { key: 'created_at', label: 'Created', render: (item) => formatDateTime(item.created_at) },
  { key: 'updated_at', label: 'Updated', render: (item) => formatDateTime(item.updated_at) },
  {
    key: 'documents',
    label: 'Documents',
    fullWidth: true,
    render: (item) => (
      <OrganizationDocumentsList
        documents={item.documents || []}
        allowDownload
        emptyMessage="No documents uploaded for this organization."
      />
    ),
  },
]

export default function OrganizationDetailModal({ organizationId, open, onClose }) {
  const queryClient = useQueryClient()
  const id = organizationId

  const activateMutation = useMutation({
    mutationFn: () => organizationService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization activated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => organizationService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization deactivated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <ResourceDetailModal
      recordId={id}
      open={open}
      onClose={onClose}
      queryKey="organizations"
      getFn={organizationService.get}
      getTitle={(item) => item.organization_name}
      fields={DETAIL_FIELDS}
      renderHeader={(item) =>
        item.logo ? (
          <div className="mb-4 flex justify-center">
            <img
              src={resolveMediaUrl(item.logo)}
              alt={item.organization_name}
              className="h-24 w-24 rounded-2xl border border-border object-cover"
            />
          </div>
        ) : null
      }
      renderFooter={(item, recordId, close) => {
        const orgId = item.organization_id || item.id || recordId
        return (
          <>
            <Button variant="cancel" onClick={close}>Close</Button>
            <Link to={`/organizations/${orgId}/edit`} onClick={close}>
              <Button variant="edit">
                <FiEdit2 className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            {item.is_active ? (
              <Button variant="danger" loading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate()}>
                Deactivate
              </Button>
            ) : (
              <Button variant="success" loading={activateMutation.isPending} onClick={() => activateMutation.mutate()}>
                Activate
              </Button>
            )}
          </>
        )
      }}
    />
  )
}
