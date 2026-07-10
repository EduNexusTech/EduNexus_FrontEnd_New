import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { parentService } from '@/api/services'
import {
  PARENT_COMMUNICATION_OPTIONS,
  PARENT_EDUCATION_OPTIONS,
  PARENT_INCOME_RANGE_OPTIONS,
  PARENT_STATUS_OPTIONS,
} from '@/config/constants'

const fields = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'mobile_number', label: 'Mobile', type: 'text', required: true },
  { name: 'parent_code', label: 'Parent Code', type: 'text', help: 'Leave blank to auto-generate' },
  { name: 'date_of_birth', label: 'Date of Birth', type: 'date' },
  {
    name: 'gender',
    label: 'Gender',
    type: 'select',
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ],
  },
  { name: 'occupation', label: 'Occupation', type: 'text' },
  { name: 'employer', label: 'Employer', type: 'text' },
  { name: 'income_range', label: 'Income Range', type: 'select', options: PARENT_INCOME_RANGE_OPTIONS },
  { name: 'education', label: 'Education', type: 'select', options: PARENT_EDUCATION_OPTIONS },
  { name: 'education_details', label: 'Education Details', type: 'text' },
  { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'pincode', label: 'Pincode', type: 'text' },
  { name: 'emergency_contact_name', label: 'Emergency Contact Name', type: 'text' },
  { name: 'emergency_contact_phone', label: 'Emergency Contact Phone', type: 'text' },
  { name: 'emergency_contact_relation', label: 'Emergency Relation', type: 'text' },
  { name: 'guardian_name', label: 'Guardian Name', type: 'text' },
  { name: 'guardian_relation', label: 'Guardian Relation', type: 'text' },
  { name: 'guardian_phone', label: 'Guardian Phone', type: 'text' },
  { name: 'guardian_address', label: 'Guardian Address', type: 'textarea', fullWidth: true },
  { name: 'communication_preference', label: 'Communication Preference', type: 'select', options: PARENT_COMMUNICATION_OPTIONS },
  { name: 'preferred_language', label: 'Preferred Language', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: PARENT_STATUS_OPTIONS },
  { name: 'mobile_app_access', label: 'Enable mobile app access', type: 'checkbox' },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
  { name: 'send_credentials', label: 'Send login credentials on create', type: 'checkbox' },
]

export default function ParentForm() {
  return (
    <ResourceFormPage
      title="Parent"
      queryKey="parents"
      getFn={parentService.get}
      createFn={parentService.create}
      updateFn={parentService.update}
      basePath="/parents"
      fields={fields}
      transformLoad={(item) => ({
        first_name: item.full_name?.split(' ')[0] || '',
        last_name: item.full_name?.split(' ').slice(1).join(' ') || '',
        email: item.email || '',
        mobile_number: item.mobile_number || '',
        parent_code: item.parent_code || '',
        date_of_birth: item.date_of_birth || '',
        gender: item.gender || '',
        occupation: item.occupation || '',
        employer: item.employer || '',
        income_range: item.income_range || '',
        education: item.education || '',
        education_details: item.education_details || '',
        address: item.address || '',
        city: item.city || '',
        pincode: item.pincode || '',
        emergency_contact_name: item.emergency_contact_name || '',
        emergency_contact_phone: item.emergency_contact_phone || '',
        emergency_contact_relation: item.emergency_contact_relation || '',
        guardian_name: item.guardian_name || '',
        guardian_relation: item.guardian_relation || '',
        guardian_phone: item.guardian_phone || '',
        guardian_address: item.guardian_address || '',
        communication_preference: item.communication_preference || 'all',
        preferred_language: item.preferred_language || 'en',
        status: item.status || 'active',
        mobile_app_access: item.mobile_app_access !== false,
        notes: item.notes || '',
      })}
      transformSubmit={(values) => ({
        ...values,
        send_credentials: Boolean(values.send_credentials),
        mobile_app_access: Boolean(values.mobile_app_access),
      })}
    />
  )
}
