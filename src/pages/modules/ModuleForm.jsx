import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { moduleService } from '@/api/services'

const fields = [
  { name: 'organization_id', label: 'Organization ID', type: 'text', required: true },
  { name: 'module_name', label: 'Module Name', type: 'text', required: true },
  { name: 'module_code', label: 'Module Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'icon', label: 'Icon', type: 'text' },
  { name: 'sequence', label: 'Sequence', type: 'number' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

export default function ModuleForm() {
  return (
    <ResourceFormPage
      title="Module"
      queryKey="modules"
      getFn={moduleService.get}
      createFn={moduleService.create}
      updateFn={moduleService.update}
      basePath="/modules"
      fields={fields}
    />
  )
}
