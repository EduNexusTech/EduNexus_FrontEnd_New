import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { menuService } from '@/api/services'

const fields = [
  { name: 'module', label: 'Module ID', type: 'text', required: true },
  { name: 'menu_name', label: 'Menu Name', type: 'text', required: true },
  { name: 'menu_code', label: 'Menu Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'url', label: 'URL', type: 'text' },
  { name: 'icon', label: 'Icon', type: 'text' },
  { name: 'sequence', label: 'Sequence', type: 'number' },
  { name: 'parent', label: 'Parent Menu ID', type: 'text' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

export default function MenuForm() {
  return (
    <ResourceFormPage
      title="Menu"
      queryKey="menus"
      getFn={menuService.get}
      createFn={menuService.create}
      updateFn={menuService.update}
      basePath="/menus"
      fields={fields}
    />
  )
}
