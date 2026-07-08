import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { roleService, schoolService, userRoleService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { useOrganizationOptions, useUserOptions } from '@/hooks/useFormOptions'

function transformUserRoleLoad(item) {
  return {
    organization: item.organization ? String(item.organization) : '',
    user: item.user ? String(item.user) : '',
    role: item.role ? String(item.role) : '',
    school: item.school ? String(item.school) : '',
  }
}

function groupByOrg(results, { valueKey, labelFn }) {
  const map = {}
  results.forEach((row) => {
    const orgId = String(row.organization_id || '')
    if (!orgId) return
    if (!map[orgId]) map[orgId] = []
    map[orgId].push({
      value: String(row[valueKey] || row.id),
      label: labelFn(row),
    })
  })
  return map
}

export default function UserRoleForm() {
  const orgQuery = useOrganizationOptions()
  const userQuery = useUserOptions()

  const rolesQuery = useQuery({
    queryKey: ['roles', 'user-role-form-all'],
    queryFn: () => roleService.list({ page_size: 500, ordering: 'role_name' }),
    staleTime: 5 * 60 * 1000,
  })

  const schoolsQuery = useQuery({
    queryKey: ['schools', 'user-role-form-all'],
    queryFn: () => schoolService.list({ page_size: 500, ordering: 'school_name' }),
    staleTime: 5 * 60 * 1000,
  })

  const usersByOrg = useMemo(() => {
    const map = {}
    userQuery.options.forEach((opt) => {
      if (!opt.organizationId) return
      const key = String(opt.organizationId)
      if (!map[key]) map[key] = []
      map[key].push({ value: opt.value, label: opt.label })
    })
    return map
  }, [userQuery.options])

  const rolesByOrg = useMemo(() => {
    const { results } = unwrapList(rolesQuery.data)
    return groupByOrg(results, {
      valueKey: 'role_id',
      labelFn: (role) => `${role.role_name} (${role.role_code})`,
    })
  }, [rolesQuery.data])

  const schoolsByOrg = useMemo(() => {
    const { results } = unwrapList(schoolsQuery.data)
    return groupByOrg(results, {
      valueKey: 'school_id',
      labelFn: (school) =>
        `${school.school_name}${school.school_code ? ` (${school.school_code})` : ''}`,
    })
  }, [schoolsQuery.data])

  const fields = useMemo(
    () => [
      {
        name: 'organization',
        label: 'Organization',
        type: 'select',
        required: true,
        options: orgQuery.options,
        placeholder: 'Select organization',
      },
      {
        name: 'user',
        label: 'User',
        type: 'select',
        required: true,
        dependsOn: 'organization',
        placeholder: 'Select user',
        disabled: (values) => !values?.organization,
        getOptions: (values) => usersByOrg[String(values?.organization)] || [],
      },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        required: true,
        dependsOn: 'organization',
        placeholder: 'Select role',
        disabled: (values) => !values?.organization,
        getOptions: (values) => rolesByOrg[String(values?.organization)] || [],
      },
      {
        name: 'school',
        label: 'School',
        type: 'select',
        dependsOn: 'organization',
        placeholder: 'Select school (optional)',
        disabled: (values) => !values?.organization,
        getOptions: (values) => schoolsByOrg[String(values?.organization)] || [],
      },
    ],
    [orgQuery.options, usersByOrg, rolesByOrg, schoolsByOrg],
  )

  const loading = orgQuery.isLoading || userQuery.isLoading || rolesQuery.isLoading || schoolsQuery.isLoading
  if (loading) return <PageLoader />
  if (orgQuery.error) {
    return <ErrorState message={getErrorMessage(orgQuery.error, 'Failed to load organizations')} onRetry={orgQuery.refetch} />
  }

  return (
    <ResourceFormPage
      title="User Role"
      queryKey="user-roles"
      getFn={userRoleService.get}
      createFn={userRoleService.create}
      updateFn={userRoleService.update}
      basePath="/user-roles"
      fields={fields}
      transformLoad={transformUserRoleLoad}
      transformSubmit={(data) => {
        const payload = { ...data }
        if (!payload.school) delete payload.school
        return payload
      }}
    />
  )
}
