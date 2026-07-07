import { Link, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ResourceDetailPage } from '@/components/crud/ResourceFormPage'
import { organizationService } from '@/api/services'
import Button from '@/components/ui/Button'
import { getErrorMessage } from '@/api/client'
import { StatusBadge } from '@/components/ui/Feedback'

export default function OrganizationDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()

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
          <Link to={`/organizations/${id}/edit`}><Button variant="secondary">Edit</Button></Link>
          {item.is_active ? (
            <Button variant="danger" loading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate()}>Deactivate</Button>
          ) : (
            <Button loading={activateMutation.isPending} onClick={() => activateMutation.mutate()}>Activate</Button>
          )}
        </>
      )}
    />
  )
}
