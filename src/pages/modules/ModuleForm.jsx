import { useMemo } from 'react'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { moduleService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { useOrganizationOptions } from '@/hooks/useFormOptions'

const BASE_FIELDS = [
  { name: 'module_name', label: 'Module Name', type: 'text', required: true },
  { name: 'module_code', label: 'Module Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'icon', label: 'Icon', type: 'text' },
  { name: 'sequence', label: 'Sequence', type: 'number' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
]

function transformModuleLoad(item) {
  return {
    organization_id: item.organization_id ? String(item.organization_id) : '',
    module_name: item.module_name || '',
    module_code: item.module_code || '',
    icon: item.icon || '',
    sequence: item.sequence ?? '',
    is_active: item.is_active ?? true,
  }
}

export default function ModuleForm() {
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
      title="Module"
      queryKey="modules"
      getFn={moduleService.get}
      createFn={moduleService.create}
      updateFn={moduleService.update}
      basePath="/modules"
      fields={fields}
      transformLoad={transformModuleLoad}
    />
  )
}
