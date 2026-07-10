import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { schoolService, userService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { saveUserPassword } from '@/utils/userPasswordStorage'
import { getErrorMessage, unwrapList } from '@/api/client'
import { ROLE_TYPES } from '@/config/constants'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { useOrganizationOptions } from '@/hooks/useFormOptions'

function transformUserLoad(item) {
  return {
    first_name: item.first_name || '',
    last_name: item.last_name || '',
    email: item.email || '',
    mobile_number: item.mobile_number || '',
    password: '',
    organization_id: item.organization_id ? String(item.organization_id) : '',
    school_id: item.school_id ? String(item.school_id) : '',
    role_type: item.role_type || '',
    is_active: item.is_active ?? true,
  }
}

export default function UserForm() {
  const orgQuery = useOrganizationOptions()

  const allSchoolsQuery = useQuery({
    queryKey: ['schools', 'user-form-all'],
    queryFn: () => schoolService.list({ page_size: 500, ordering: 'school_name' }),
    staleTime: 5 * 60 * 1000,
  })

  const schoolsByOrg = useMemo(() => {
    const { results } = unwrapList(allSchoolsQuery.data)
    const map = {}
    results.forEach((school) => {
      const orgId = String(school.organization_id || '')
      if (!orgId) return
      if (!map[orgId]) map[orgId] = []
      map[orgId].push({
        label: `${school.school_name}${school.school_code ? ` (${school.school_code})` : ''}`,
        value: String(school.school_id || school.id),
      })
    })
    return map
  }, [allSchoolsQuery.data])

  const fields = useMemo(
    () => [
      { name: 'first_name', label: 'First Name', type: 'text', required: true },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'mobile_number', label: 'Mobile', type: 'text' },
      { name: 'password', label: 'Password', type: 'password' },
      {
        name: 'organization_id',
        label: 'Organization',
        type: 'select',
        required: true,
        options: orgQuery.options,
        placeholder: 'Select organization',
      },
      {
        name: 'school_id',
        label: 'School',
        type: 'select',
        dependsOn: 'organization_id',
        placeholder: 'Select school',
        disabled: (values) => !values?.organization_id,
        getOptions: (values) => {
          if (!values?.organization_id) return []
          return schoolsByOrg[String(values.organization_id)] || []
        },
      },
      { name: 'role_type', label: 'Role Type', type: 'select', options: ROLE_TYPES },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    [orgQuery.options, schoolsByOrg],
  )

  if (orgQuery.isLoading || allSchoolsQuery.isLoading) return <PageLoader />
  if (orgQuery.error) {
    return <ErrorState message={getErrorMessage(orgQuery.error, 'Failed to load organizations')} onRetry={orgQuery.refetch} />
  }
  if (allSchoolsQuery.error) {
    return <ErrorState message={getErrorMessage(allSchoolsQuery.error, 'Failed to load schools')} onRetry={allSchoolsQuery.refetch} />
  }

  return (
    <ResourceFormPage
      title="User"
      queryKey="users"
      getFn={userService.get}
      createFn={userService.create}
      updateFn={userService.update}
      basePath="/users"
      fields={fields}
      transformLoad={transformUserLoad}
      transformSubmit={(data) => {
        const payload = { ...data }
        if (!payload.password) delete payload.password
        if (!payload.organization_id) delete payload.organization_id
        if (!payload.school_id) delete payload.school_id
        return payload
      }}
      onSuccess={({ response, formData, isEdit }) => {
        if (isEdit || !formData?.password) return
        const created = unwrapData(response)
        const userId = created?.user_id || created?.id
        saveUserPassword(userId, formData.password, formData.email)
      }}
    />
  )
}
