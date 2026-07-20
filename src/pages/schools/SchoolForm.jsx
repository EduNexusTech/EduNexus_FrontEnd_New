import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { FiFileText } from 'react-icons/fi'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { organizationService, schoolService } from '@/api/services'
import { getErrorMessage, unwrapData, unwrapList } from '@/api/client'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  SchoolDocumentsList,
  SchoolDocumentsUploader,
  useSchoolDocumentDelete,
} from './SchoolDocumentsModal'

const SCHOOL_TYPE_OPTIONS = [
  { label: 'CBSE', value: 'cbse' },
  { label: 'ICSE', value: 'icse' },
  { label: 'ISC', value: 'isc' },
  { label: 'State Board', value: 'state_board' },
  { label: 'IGCSE', value: 'igcse' },
  { label: 'IB', value: 'ib' },
  { label: 'Cambridge', value: 'cambridge' },
  { label: 'PU College', value: 'pu_college' },
  { label: 'Degree College', value: 'degree_college' },
  { label: 'Training Institute', value: 'training_institute' },
  { label: 'Kindergarten', value: 'kindergarten' },
  { label: 'Play School', value: 'play_school' },
  { label: 'University', value: 'university' },
  { label: 'Coaching Institute', value: 'coaching_institute' },
  { label: 'Other', value: 'other' },
]

const SCHOOL_FIELDS = [
  { name: 'school_name', label: 'School Name', type: 'text', required: true },
  { name: 'school_code', label: 'School Code', type: 'text', required: true, readOnlyOnEdit: true },
  { name: 'short_name', label: 'Short Name', type: 'text' },
  { name: 'legal_name', label: 'Legal Name', type: 'text' },
  { name: 'affiliation_number', label: 'Affiliation Number', type: 'text' },
  { name: 'school_type', label: 'School Type', type: 'select', options: SCHOOL_TYPE_OPTIONS },
  {
    name: 'medium',
    label: 'Medium',
    type: 'select',
    options: [
      { label: 'English', value: 'english' },
      { label: 'Hindi', value: 'hindi' },
      { label: 'Regional', value: 'regional' },
      { label: 'Bilingual', value: 'bilingual' },
      { label: 'Other', value: 'other' },
    ],
  },
  {
    name: 'school_category',
    label: 'Category',
    type: 'select',
    options: [
      { label: 'Co-Educational', value: 'coed' },
      { label: 'Boys', value: 'boys' },
      { label: 'Girls', value: 'girls' },
    ],
  },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'alternate_phone', label: 'Alternate Phone', type: 'text' },
  { name: 'website', label: 'Website', type: 'text' },
  { name: 'principal_name', label: 'Principal', type: 'text' },
  { name: 'vice_principal_name', label: 'Vice Principal', type: 'text' },
  { name: 'head_office_contact', label: 'Head Office Contact', type: 'text' },
  { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
  { name: 'pincode', label: 'Pincode', type: 'text' },
  { name: 'latitude', label: 'Latitude', type: 'text' },
  { name: 'longitude', label: 'Longitude', type: 'text' },
  { name: 'google_map_url', label: 'Google Map URL', type: 'text', fullWidth: true },
  { name: 'motto', label: 'Motto', type: 'text', fullWidth: true },
  { name: 'mission', label: 'Mission', type: 'textarea', fullWidth: true },
  { name: 'vision', label: 'Vision', type: 'textarea', fullWidth: true },
  { name: 'established_date', label: 'Established Date', type: 'date' },
  { name: 'recognition_details', label: 'Recognition Details', type: 'textarea', fullWidth: true },
  { name: 'registration_details', label: 'Registration Details', type: 'textarea', fullWidth: true },
  { name: 'academic_start_month', label: 'Academic Start Month', type: 'number' },
  { name: 'academic_calendar', label: 'Academic Calendar', type: 'text' },
  { name: 'language', label: 'Language', type: 'text', placeholder: 'en' },
  { name: 'timezone', label: 'Timezone', type: 'text', placeholder: 'Asia/Kolkata' },
  { name: 'currency', label: 'Currency', type: 'text', placeholder: 'INR' },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
      { label: 'Suspended', value: 'suspended' },
    ],
  },
]

function transformSchoolLoad(item) {
  return {
    organization_id: item.organization_id ? String(item.organization_id) : '',
    school_name: item.school_name || '',
    school_code: item.school_code || '',
    short_name: item.short_name || '',
    legal_name: item.legal_name || '',
    affiliation_number: item.affiliation_number || '',
    school_type: item.school_type || 'other',
    medium: item.medium || 'english',
    school_category: item.school_category || 'coed',
    email: item.email || '',
    phone: item.phone || '',
    alternate_phone: item.alternate_phone || '',
    website: item.website || '',
    principal_name: item.principal_name || '',
    vice_principal_name: item.vice_principal_name || '',
    head_office_contact: item.head_office_contact || '',
    address: item.address || '',
    pincode: item.pincode || '',
    latitude: item.latitude ?? '',
    longitude: item.longitude ?? '',
    google_map_url: item.google_map_url || '',
    motto: item.motto || '',
    mission: item.mission || '',
    vision: item.vision || '',
    established_date: item.established_date || '',
    recognition_details: item.recognition_details || '',
    registration_details: item.registration_details || '',
    academic_start_month: item.academic_start_month ?? '',
    academic_calendar: item.academic_calendar || '',
    language: item.language || 'en',
    timezone: item.timezone || '',
    currency: item.currency || '',
    status: item.status || 'active',
  }
}

function SchoolDocumentsEditSection({ schoolId }) {
  const queryClient = useQueryClient()
  const { data } = useQuery({
    queryKey: ['schools', schoolId],
    queryFn: () => schoolService.get(schoolId),
    enabled: Boolean(schoolId),
  })
  const school = unwrapData(data)
  const documents = school?.documents || []
  const { deleteDocument, deletingId } = useSchoolDocumentDelete(schoolId, [
    'schools',
    ['schools', schoolId],
  ])

  return (
    <Card className="w-full p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <FiFileText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text">Documents</h2>
          <p className="text-sm text-muted">Upload multiple files or remove existing ones</p>
        </div>
      </div>

      <div className="space-y-6">
        <SchoolDocumentsUploader
          schoolId={schoolId}
          onUploaded={() => {
            queryClient.invalidateQueries({ queryKey: ['schools'] })
            queryClient.invalidateQueries({ queryKey: ['schools', schoolId] })
          }}
        />
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text">Uploaded documents</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">
              {documents.length}
            </span>
          </div>
          <SchoolDocumentsList
            documents={documents}
            allowDownload
            allowDelete
            onDelete={deleteDocument}
            deletingId={deletingId}
          />
        </div>
      </div>
    </Card>
  )
}

export default function SchoolForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)

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
    <div className="space-y-6">
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
      {isEdit && <SchoolDocumentsEditSection schoolId={id} />}
    </div>
  )
}
