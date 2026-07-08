import { useMemo } from 'react'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { membershipService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { useOrganizationOptions, useUserOptions } from '@/hooks/useFormOptions'

function transformMembershipLoad(item) {
  return {
    user: item.user ? String(item.user) : '',
    organization: item.organization ? String(item.organization) : '',
    is_admin: item.is_admin ?? false,
    is_active: item.is_active ?? true,
  }
}

export default function MembershipForm() {
  const orgQuery = useOrganizationOptions()
  const userQuery = useUserOptions()

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
        getOptions: (values) => {
          if (!values?.organization) return []
          return userQuery.options.filter(
            (opt) => !opt.organizationId || opt.organizationId === String(values.organization),
          )
        },
      },
      { name: 'is_admin', label: 'Organization Admin', type: 'checkbox' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    [orgQuery.options, userQuery.options],
  )

  if (orgQuery.isLoading || userQuery.isLoading) return <PageLoader />
  if (orgQuery.error) {
    return <ErrorState message={getErrorMessage(orgQuery.error, 'Failed to load organizations')} onRetry={orgQuery.refetch} />
  }
  if (userQuery.error) {
    return <ErrorState message={getErrorMessage(userQuery.error, 'Failed to load users')} onRetry={userQuery.refetch} />
  }

  return (
    <ResourceFormPage
      title="Membership"
      queryKey="memberships"
      getFn={membershipService.get}
      createFn={membershipService.create}
      updateFn={membershipService.update}
      basePath="/memberships"
      fields={fields}
      transformLoad={transformMembershipLoad}
    />
  )
}
