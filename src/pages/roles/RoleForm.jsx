import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { roleService } from '@/api/services'

const fields = [
  { name: 'organization_id', label: 'Organization ID', type: 'text', required: true },
  { name: 'role_name', label: 'Role Name', type: 'text', required: true },
  { name: 'role_code', label: 'Role Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ]},
]

export default function RoleForm() {
  return (
    <ResourceFormPage
      title="Role"
      queryKey="roles"
      getFn={roleService.get}
      createFn={roleService.create}
      updateFn={roleService.update}
      basePath="/roles"
      fields={fields}
    />
  )
}
