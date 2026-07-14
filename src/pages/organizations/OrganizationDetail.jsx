import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ResourceDetailPage } from '@/components/crud/ResourceFormPage'
import { organizationService } from '@/api/services'
import Button from '@/components/ui/Button'
import { getErrorMessage, unwrapData } from '@/api/client'
import { StatusBadge } from '@/components/ui/Feedback'
import { OrganizationDocumentsList } from './OrganizationDocumentsModal'

export default function OrganizationDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['organizations', id],
    queryFn: () => organizationService.get(id),
  })
  const organization = unwrapData(data)

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
    <div className="space-y-6">
      <ResourceDetailPage
        title="Organization"
        queryKey="organizations"
        getFn={organizationService.get}
        basePath="/organizations"
        fields={[
          { key: 'organization_name', label: 'Name' },
          { key: 'organization_code', label: 'Code' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'website', label: 'Website' },
          { key: 'address', label: 'Address' },
          { key: 'city', label: 'City' },
          { key: 'state', label: 'State' },
          { key: 'country', label: 'Country' },
          { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
        ]}
        actions={(item) => (
          <>
            <Link to={`/organizations/${id}/edit`}><Button variant="edit">Edit</Button></Link>
            {item.is_active ? (
              <Button variant="danger" loading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate()}>Deactivate</Button>
            ) : (
              <Button loading={activateMutation.isPending} onClick={() => activateMutation.mutate()}>Activate</Button>
            )}
          </>
        )}
      />

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">Documents</h2>
            <p className="text-sm text-muted">Download uploaded organization files</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">
            {(organization?.documents || []).length}
          </span>
        </div>
        <OrganizationDocumentsList
          documents={organization?.documents || []}
          allowDownload
          emptyMessage="No documents uploaded for this organization."
        />
      </div>
    </div>
  )
}
