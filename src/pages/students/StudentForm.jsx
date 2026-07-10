import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { studentService } from '@/api/services'
import { STUDENT_STATUS_OPTIONS } from '@/config/constants'

const fields = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'mobile_number', label: 'Mobile', type: 'text', required: true },
  { name: 'admission_number', label: 'Admission Number', type: 'text' },
  { name: 'roll_number', label: 'Roll Number', type: 'text' },
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
  { name: 'blood_group', label: 'Blood Group', type: 'text' },
  { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'pincode', label: 'Pincode', type: 'text' },
  { name: 'previous_school', label: 'Previous School', type: 'text' },
  { name: 'previous_class', label: 'Previous Class', type: 'text' },
  { name: 'emergency_contact_name', label: 'Emergency Contact', type: 'text' },
  { name: 'emergency_contact_phone', label: 'Emergency Phone', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: STUDENT_STATUS_OPTIONS },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
]

export default function StudentForm() {
  return (
    <ResourceFormPage
      title="Student"
      queryKey="students"
      getFn={studentService.get}
      createFn={studentService.create}
      updateFn={studentService.update}
      basePath="/students"
      fields={fields}
      transformLoad={(item) => ({
        first_name: item.full_name?.split(' ')[0] || '',
        last_name: item.full_name?.split(' ').slice(1).join(' ') || '',
        email: item.email || '',
        mobile_number: item.mobile_number || '',
        admission_number: item.admission_number || '',
        roll_number: item.roll_number || '',
        date_of_birth: item.date_of_birth || '',
        gender: item.gender || '',
        blood_group: item.blood_group || '',
        address: item.address || '',
        city: item.city || '',
        pincode: item.pincode || '',
        previous_school: item.previous_school || '',
        previous_class: item.previous_class || '',
        emergency_contact_name: item.emergency_contact_name || '',
        emergency_contact_phone: item.emergency_contact_phone || '',
        status: item.status || 'active',
        notes: item.notes || '',
      })}
    />
  )
}
