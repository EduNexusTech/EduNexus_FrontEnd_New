import { useMemo } from 'react'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { parentService } from '@/api/services'
import {
  PARENT_COMMUNICATION_OPTIONS,
  PARENT_EDUCATION_OPTIONS,
  PARENT_INCOME_RANGE_OPTIONS,
  PARENT_STATUS_OPTIONS,
} from '@/config/constants'

export default function ParentForm() {
  const fields = useMemo(() => [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'middle_name', label: 'Middle Name', type: 'text' },
    { name: 'last_name', label: 'Last Name', type: 'text' },
    { name: 'preferred_name', label: 'Preferred Name', type: 'text' },
    { name: 'email', label: 'Primary Email', type: 'email' },
    { name: 'mobile_number', label: 'Primary Mobile', type: 'text', required: true },
    { name: 'whatsapp_number', label: 'WhatsApp', type: 'text' },
    { name: 'secondary_mobile', label: 'Secondary Mobile', type: 'text' },
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
    { name: 'company', label: 'Company', type: 'text' },
    { name: 'designation', label: 'Designation', type: 'text' },
    { name: 'education', label: 'Education', type: 'select', options: PARENT_EDUCATION_OPTIONS },
    { name: 'income_range', label: 'Income Range', type: 'select', options: PARENT_INCOME_RANGE_OPTIONS },
    { name: 'aadhaar_number', label: 'Aadhaar', type: 'text' },
    { name: 'permanent_address', label: 'Permanent Address', type: 'textarea', fullWidth: true },
    { name: 'current_address', label: 'Current Address', type: 'textarea', fullWidth: true },
    { name: 'city', label: 'City', type: 'text' },
    { name: 'pincode', label: 'Pincode', type: 'text' },
    {
      name: 'communication_preference',
      label: 'Preferred Communication',
      type: 'select',
      options: PARENT_COMMUNICATION_OPTIONS,
    },
    { name: 'status', label: 'Status', type: 'select', options: PARENT_STATUS_OPTIONS },
    { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    { name: 'send_credentials', label: 'Send portal credentials on create', type: 'checkbox' },
  ], [])

  return (
    <ResourceFormPage
      title="Guardian"
      queryKey="parents"
      getFn={parentService.get}
      createFn={parentService.create}
      updateFn={parentService.update}
      basePath="/parents"
      fields={fields}
      transformLoad={(item) => ({
        first_name: item.full_name?.split(' ')[0] || '',
        last_name: item.full_name?.split(' ').slice(1).join(' ') || '',
        middle_name: item.middle_name || '',
        preferred_name: item.preferred_name || '',
        email: item.email || '',
        mobile_number: item.mobile_number || '',
        whatsapp_number: item.whatsapp_number || '',
        secondary_mobile: item.secondary_mobile || '',
        date_of_birth: item.date_of_birth || '',
        gender: item.gender || '',
        occupation: item.occupation || '',
        company: item.company || '',
        designation: item.designation || '',
        education: item.education || '',
        income_range: item.income_range || '',
        aadhaar_number: item.aadhaar_number || '',
        permanent_address: item.permanent_address || item.address || '',
        current_address: item.current_address || '',
        city: item.city || '',
        pincode: item.pincode || '',
        communication_preference: item.communication_preference || 'all',
        status: item.status || 'active',
        notes: item.notes || '',
      })}
      transformSubmit={(values) => ({
        ...values,
        send_credentials: Boolean(values.send_credentials),
      })}
    />
  )
}
