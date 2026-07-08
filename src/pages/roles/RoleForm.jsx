import { useMemo } from 'react'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { roleService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { useOrganizationOptions } from '@/hooks/useFormOptions'

const BASE_FIELDS = [
  { name: 'role_name', label: 'Role Name', type: 'text', required: true },
  { name: 'role_code', label: 'Role Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
]

function transformRoleLoad(item) {
  return {
    organization_id: item.organization_id ? String(item.organization_id) : '',
    role_name: item.role_name || '',
    role_code: item.role_code || '',
    description: item.description || '',
    status: item.status || 'active',
  }
}

export default function RoleForm() {
  const orgQuery = useOrganizationOptions()

  const fields = useMemo(
    () => [
      {
        name: 'organization_id',
        label: 'Organization',
        type: 'select',
        required: true,
        readOnlyOnEdit: true,
        options: orgQuery.options,
        placeholder: 'Select organization',
      },
      ...BASE_FIELDS,
    ],
    [orgQuery.options],
  )

  if (orgQuery.isLoading) return <PageLoader />
  if (orgQuery.error) {
    return <ErrorState message={getErrorMessage(orgQuery.error, 'Failed to load organizations')} onRetry={orgQuery.refetch} />
  }

  return (
    <ResourceFormPage
      title="Role"
      queryKey="roles"
      getFn={roleService.get}
      createFn={roleService.create}
      updateFn={roleService.update}
      basePath="/roles"
      fields={fields}
      transformLoad={transformRoleLoad}
    />
  )
}
