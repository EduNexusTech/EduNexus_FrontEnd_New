import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { userService } from '@/api/services'
import { ROLE_TYPES } from '@/config/constants'

const fields = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'mobile_number', label: 'Mobile', type: 'text' },
  { name: 'password', label: 'Password', type: 'password' },
  { name: 'organization_id', label: 'Organization ID', type: 'text' },
  { name: 'school_id', label: 'School ID', type: 'text' },
  { name: 'role_type', label: 'Role Type', type: 'select', options: ROLE_TYPES },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

export default function UserForm() {
  return (
    <ResourceFormPage
      title="User"
      queryKey="users"
      getFn={userService.get}
      createFn={userService.create}
      updateFn={userService.update}
      basePath="/users"
      fields={fields}
      transformSubmit={(data) => {
        const payload = { ...data }
        if (!payload.password) delete payload.password
        return payload
      }}
    />
  )
}
