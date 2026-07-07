import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { permissionService } from '@/api/services'

const fields = [
  { name: 'permission_name', label: 'Permission Name', type: 'text', required: true },
  { name: 'permission_code', label: 'Permission Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'module', label: 'Module', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
]

export default function PermissionForm() {
  return (
    <ResourceFormPage
      title="Permission"
      queryKey="permissions"
      getFn={permissionService.get}
      createFn={permissionService.create}
      updateFn={permissionService.update}
      basePath="/permissions"
      fields={fields}
    />
  )
}
