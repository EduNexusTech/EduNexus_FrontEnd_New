import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { teacherService } from '@/api/services'
import { TEACHER_STATUS_OPTIONS } from '@/config/constants'

const fields = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'mobile_number', label: 'Mobile', type: 'text', required: true },
  { name: 'employee_id', label: 'Employee ID', type: 'text', help: 'Leave blank to auto-generate' },
  { name: 'designation', label: 'Designation', type: 'text' },
  { name: 'department', label: 'Department', type: 'text' },
  { name: 'joining_date', label: 'Joining Date', type: 'date' },
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
  { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'pincode', label: 'Pincode', type: 'text' },
  { name: 'bio', label: 'Bio', type: 'textarea', fullWidth: true },
  { name: 'emergency_contact_name', label: 'Emergency Contact', type: 'text' },
  { name: 'emergency_contact_phone', label: 'Emergency Phone', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: TEACHER_STATUS_OPTIONS },
  { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
  { name: 'send_credentials', label: 'Send login credentials on create', type: 'checkbox' },
]

export default function TeacherForm() {
  return (
    <ResourceFormPage
      title="Teacher"
      queryKey="teachers"
      getFn={teacherService.get}
      createFn={teacherService.create}
      updateFn={teacherService.update}
      basePath="/teachers"
      fields={fields}
      transformLoad={(item) => ({
        first_name: item.full_name?.split(' ')[0] || '',
        last_name: item.full_name?.split(' ').slice(1).join(' ') || '',
        email: item.email || '',
        mobile_number: item.mobile_number || '',
        employee_id: item.employee_id || '',
        designation: item.designation || '',
        department: item.department || '',
        joining_date: item.joining_date || '',
        date_of_birth: item.date_of_birth || '',
        gender: item.gender || '',
        address: item.address || '',
        city: item.city || '',
        pincode: item.pincode || '',
        bio: item.bio || '',
        emergency_contact_name: item.emergency_contact_name || '',
        emergency_contact_phone: item.emergency_contact_phone || '',
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
