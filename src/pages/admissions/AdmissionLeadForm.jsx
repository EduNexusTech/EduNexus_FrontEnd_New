import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { admissionService } from '@/api/services'
import { LEAD_SOURCE_OPTIONS } from '@/config/constants'

const fields = [
  { name: 'student_name', label: 'Student Name', type: 'text', required: true },
  { name: 'parent_name', label: 'Parent Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'mobile_number', label: 'Mobile', type: 'text', required: true },
  { name: 'alternate_mobile', label: 'Alternate Mobile', type: 'text' },
  { name: 'source', label: 'Source', type: 'select', options: LEAD_SOURCE_OPTIONS },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
]

export default function AdmissionLeadForm() {
  return (
    <ResourceFormPage
      title="Admission Lead"
      queryKey="admission-leads"
      getFn={admissionService.leads.get}
      createFn={admissionService.leads.create}
      updateFn={admissionService.leads.update}
      basePath="/admissions/leads"
      fields={fields}
    />
  )
}
