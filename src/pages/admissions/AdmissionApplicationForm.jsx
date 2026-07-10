import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { admissionService } from '@/api/services'

const fields = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text' },
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
  { name: 'email', label: 'Student Email', type: 'email' },
  { name: 'mobile_number', label: 'Student Mobile', type: 'text', required: true },
  { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'pincode', label: 'Pincode', type: 'text' },
  { name: 'previous_school', label: 'Previous School', type: 'text' },
  { name: 'parent_name', label: 'Parent Name', type: 'text' },
  { name: 'parent_email', label: 'Parent Email', type: 'email' },
  { name: 'parent_mobile', label: 'Parent Mobile', type: 'text' },
  { name: 'fee_amount', label: 'Admission Fee', type: 'number' },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
  { name: 'send_credentials', label: 'Send login credentials on enroll', type: 'checkbox' },
]

export default function AdmissionApplicationForm() {
  return (
    <ResourceFormPage
      title="Admission Application"
      queryKey="admission-applications"
      getFn={admissionService.applications.get}
      createFn={admissionService.applications.create}
      updateFn={admissionService.applications.update}
      basePath="/admissions/applications"
      fields={fields}
      transformSubmit={(data) => ({
        ...data,
        send_credentials: Boolean(data.send_credentials),
      })}
    />
  )
}
