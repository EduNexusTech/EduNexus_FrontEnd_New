import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { organizationService, schoolService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import Button from '@/components/ui/Button'

const SCHOOL_FIELDS = [
  { name: 'school_name', label: 'School Name', type: 'text', required: true },
  { name: 'school_code', label: 'School Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'website', label: 'Website', type: 'text' },
  { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
  { name: 'academic_start_month', label: 'Academic Start Month', type: 'number' },
  { name: 'timezone', label: 'Timezone', type: 'text', placeholder: 'Asia/Kolkata' },
  { name: 'currency', label: 'Currency', type: 'text', placeholder: 'INR' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Pending', value: 'pending' },
    ],
  },
]

function transformSchoolLoad(item) {
  return {
    organization_id: item.organization_id ? String(item.organization_id) : '',
    school_name: item.school_name || '',
    school_code: item.school_code || '',
    email: item.email || '',
    phone: item.phone || '',
    website: item.website || '',
    address: item.address || '',
    academic_start_month: item.academic_start_month ?? '',
    timezone: item.timezone || '',
    currency: item.currency || '',
    status: item.status || 'active',
  }
}

export default function SchoolForm() {
  const {
    data: orgData,
    isLoading: orgsLoading,
    error: orgsError,
    refetch: refetchOrgs,
  } = useQuery({
    queryKey: ['organizations', 'school-form-options'],
    queryFn: () => organizationService.list({ page_size: 500, ordering: 'organization_name' }),
  })

  const orgOptions = useMemo(() => {
    const { results } = unwrapList(orgData)
    return results.map((org) => ({
      label: `${org.organization_name} (${org.organization_code})`,
      value: String(org.organization_id || org.id),
    }))
  }, [orgData])

  const fields = useMemo(
    () => [
      {
        name: 'organization_id',
        label: 'Organization',
        type: 'select',
        required: true,
        readOnlyOnEdit: true,
        fullWidth: true,
        options: orgOptions,
      },
      ...SCHOOL_FIELDS,
    ],
    [orgOptions],
  )

  if (orgsLoading) return <PageLoader />
  if (orgsError) {
    return <ErrorState message={getErrorMessage(orgsError, 'Failed to load organizations')} onRetry={refetchOrgs} />
  }

  if (orgOptions.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-semibold text-text">No organizations yet</h3>
        <p className="mt-2 max-w-md text-sm text-muted">
          Create an organization first, then you can add schools under it.
        </p>
        <Link to="/organizations/new" className="mt-6">
          <Button>Add Organization</Button>
        </Link>
      </div>
    )
  }

  return (
    <ResourceFormPage
      title="School"
      queryKey="schools"
      getFn={schoolService.get}
      createFn={schoolService.create}
      updateFn={schoolService.update}
      basePath="/schools"
      fields={fields}
      transformLoad={transformSchoolLoad}
    />
  )
}
