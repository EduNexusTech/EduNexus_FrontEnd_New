import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { userRoleService } from '@/api/services'

const fields = [
  { name: 'organization', label: 'Organization ID', type: 'text', required: true },
  { name: 'user', label: 'User ID', type: 'text', required: true },
  { name: 'role', label: 'Role ID', type: 'text', required: true },
  { name: 'school', label: 'School ID', type: 'text' },
]

export default function UserRoleForm() {
  return (
    <ResourceFormPage
      title="User Role"
      queryKey="user-roles"
      getFn={userRoleService.get}
      createFn={userRoleService.create}
      updateFn={userRoleService.update}
      basePath="/user-roles"
      fields={fields}
    />
  )
}
