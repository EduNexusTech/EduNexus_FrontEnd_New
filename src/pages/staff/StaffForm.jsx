import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { masterServices, staffService } from '@/api/services'
import { STAFF_ROLE_OPTIONS, STAFF_STATUS_OPTIONS } from '@/config/constants'
import { unwrapData } from '@/api/client'

export default function StaffForm() {
  const { data: deptData } = useQuery({
    queryKey: ['masters', 'departments'],
    queryFn: () => masterServices.departments.list({ page_size: 200 }),
  })
  const { data: desigData } = useQuery({
    queryKey: ['masters', 'designations'],
    queryFn: () => masterServices.designations.list({ page_size: 200 }),
  })

  const departmentOptions = useMemo(() => {
    const rows = unwrapData(deptData)?.results || []
    return rows.map((d) => ({ label: d.name, value: d.id || d.department_id }))
  }, [deptData])

  const designationOptions = useMemo(() => {
    const rows = unwrapData(desigData)?.results || []
    return rows.map((d) => ({ label: d.name, value: d.id || d.designation_id }))
  }, [desigData])

  const fields = useMemo(() => [
    { name: 'first_name', label: 'First Name', type: 'text', required: true },
    { name: 'last_name', label: 'Last Name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'mobile_number', label: 'Mobile', type: 'text', required: true },
    { name: 'employee_id', label: 'Employee ID', type: 'text', help: 'Leave blank to auto-generate' },
    {
      name: 'staff_role_code',
      label: 'Staff Role',
      type: 'select',
      options: STAFF_ROLE_OPTIONS,
      required: true,
    },
    { name: 'department', label: 'Department', type: 'select', options: departmentOptions },
    { name: 'designation', label: 'Designation', type: 'select', options: designationOptions },
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
    { name: 'emergency_contact_name', label: 'Emergency Contact', type: 'text' },
    { name: 'emergency_contact_phone', label: 'Emergency Phone', type: 'text' },
    { name: 'emergency_contact_relation', label: 'Emergency Relation', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: STAFF_STATUS_OPTIONS },
    { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
    { name: 'send_credentials', label: 'Send login credentials on create', type: 'checkbox' },
  ], [departmentOptions, designationOptions])

  return (
    <ResourceFormPage
      title="Staff Member"
      queryKey="staff"
      getFn={staffService.get}
      createFn={staffService.create}
      updateFn={staffService.update}
      basePath="/staff"
      fields={fields}
      transformLoad={(item) => ({
        first_name: item.full_name?.split(' ')[0] || '',
        last_name: item.full_name?.split(' ').slice(1).join(' ') || '',
        email: item.email || '',
        mobile_number: item.mobile_number || '',
        employee_id: item.employee_id || '',
        staff_role_code: item.staff_role_code || 'staff',
        department: item.department || '',
        designation: item.designation || '',
        joining_date: item.joining_date || '',
        date_of_birth: item.date_of_birth || '',
        gender: item.gender || '',
        address: item.address || '',
        city: item.city || '',
        pincode: item.pincode || '',
        emergency_contact_name: item.emergency_contact_name || '',
        emergency_contact_phone: item.emergency_contact_phone || '',
        emergency_contact_relation: item.emergency_contact_relation || '',
        status: item.status || 'active',
        notes: item.notes || '',
      })}
      transformSubmit={(values) => ({
        ...values,
        department: values.department || null,
        designation: values.designation || null,
        send_credentials: Boolean(values.send_credentials),
      })}
    />
  )
}
