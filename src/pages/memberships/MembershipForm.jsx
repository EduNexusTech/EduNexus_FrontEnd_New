import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { membershipService } from '@/api/services'

const fields = [
  { name: 'user', label: 'User ID', type: 'text', required: true },
  { name: 'organization', label: 'Organization ID', type: 'text', required: true },
  { name: 'is_admin', label: 'Organization Admin', type: 'checkbox' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

export default function MembershipForm() {
  return (
    <ResourceFormPage
      title="Membership"
      queryKey="memberships"
      getFn={membershipService.get}
      createFn={membershipService.create}
      updateFn={membershipService.update}
      basePath="/memberships"
      fields={fields}
    />
  )
}
