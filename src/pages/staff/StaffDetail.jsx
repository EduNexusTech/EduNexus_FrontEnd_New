import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiRefreshCw, FiSend } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState, Avatar } from '@/components/ui/Feedback'
import { staffService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import {
  STAFF_ROLE_OPTIONS,
  STAFF_SKILL_LEVEL_OPTIONS,
  STAFF_STATUS_OPTIONS,
  TEACHER_LEAVE_TYPE_OPTIONS,
} from '@/config/constants'
import { resolveMediaUrl } from '@/utils/format'

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'department', label: 'Department & Designation' },
  { key: 'shift', label: 'Shift' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'leave', label: 'Leave' },
  { key: 'payroll', label: 'Payroll' },
  { key: 'documents', label: 'Documents' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills' },
  { key: 'emergency', label: 'Emergency Contact' },
  { key: 'credentials', label: 'Login Credentials' },
  { key: 'audit', label: 'Audit Logs' },
]

const STATUS_LABELS = Object.fromEntries(STAFF_STATUS_OPTIONS.map((o) => [o.value, o.label]))
const ROLE_LABELS = Object.fromEntries(STAFF_ROLE_OPTIONS.map((o) => [o.value, o.label]))

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text">{value || '—'}</dd>
    </div>
  )
}

export default function StaffDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('profile')

  const [shiftForm, setShiftForm] = useState({
    shift_name: 'Morning', start_time: '09:00', end_time: '17:00', weekdays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], is_current: true,
  })
  const [attendanceForm, setAttendanceForm] = useState({ date: '', status: 'present' })
  const [leaveForm, setLeaveForm] = useState({ leave_type: 'casual', start_date: '', end_date: '', reason: '' })
  const [payrollForm, setPayrollForm] = useState({})
  const [docFile, setDocFile] = useState(null)
  const [docType, setDocType] = useState('other')
  const [expForm, setExpForm] = useState({ organization_name: '', role: '', start_date: '' })
  const [skillForm, setSkillForm] = useState({ skill_name: '', level: 'intermediate' })
  const [emergencyForm, setEmergencyForm] = useState({})

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffService.get(id),
  })

  const { data: auditData, refetch: refetchAudit } = useQuery({
    queryKey: ['staff', id, 'audit-logs'],
    queryFn: () => staffService.auditLogs(id),
    enabled: tab === 'audit',
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['staff', id] })
    refetch()
  }

  const shiftMut = useMutation({
    mutationFn: () => staffService.addShift(id, shiftForm),
    onSuccess: () => { invalidate(); toast.success('Shift assigned') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const attendanceMut = useMutation({
    mutationFn: () => staffService.recordAttendance(id, attendanceForm),
    onSuccess: () => { invalidate(); toast.success('Attendance recorded') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const leaveMut = useMutation({
    mutationFn: () => staffService.requestLeave(id, leaveForm),
    onSuccess: () => { invalidate(); toast.success('Leave submitted') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const approveLeaveMut = useMutation({
    mutationFn: (leaveId) => staffService.approveLeave(id, leaveId),
    onSuccess: () => { invalidate(); toast.success('Leave approved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const payrollMut = useMutation({
    mutationFn: () => staffService.updatePayroll(id, payrollForm),
    onSuccess: () => { invalidate(); toast.success('Payroll updated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const uploadMut = useMutation({
    mutationFn: (fd) => staffService.uploadDocument(id, fd),
    onSuccess: () => { invalidate(); setDocFile(null); toast.success('Document uploaded') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const expMut = useMutation({
    mutationFn: () => staffService.addExperience(id, expForm),
    onSuccess: () => { invalidate(); toast.success('Experience added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const skillMut = useMutation({
    mutationFn: () => staffService.addSkill(id, skillForm),
    onSuccess: () => { invalidate(); toast.success('Skill added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const emergencyMut = useMutation({
    mutationFn: () => staffService.updateEmergencyContact(id, emergencyForm),
    onSuccess: () => { invalidate(); toast.success('Emergency contact saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const credentialsMut = useMutation({
    mutationFn: () => staffService.sendCredentials(id, { send_email: true, send_sms: true }),
    onSuccess: () => toast.success('Credentials sent'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })
  const resetMut = useMutation({
    mutationFn: () => staffService.resetPassword(id, { send_credentials: true }),
    onSuccess: () => { invalidate(); toast.success('Password reset and sent') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const staffItem = unwrapData(data)
  const payrollRef = staffItem?.payroll_reference || {}

  useEffect(() => {
    if (!staffItem) return
    setPayrollForm({
      payroll_code: payrollRef.payroll_code || '',
      salary_grade: payrollRef.salary_grade || '',
      bank_name: payrollRef.bank_name || '',
      bank_account: payrollRef.bank_account || '',
      pf_number: payrollRef.pf_number || '',
      esi_number: payrollRef.esi_number || '',
      basic_salary: payrollRef.basic_salary || '',
      notes: payrollRef.notes || '',
    })
    setEmergencyForm({
      emergency_contact_name: staffItem.emergency_contact_name || '',
      emergency_contact_phone: staffItem.emergency_contact_phone || '',
      emergency_contact_relation: staffItem.emergency_contact_relation || '',
    })
  }, [staffItem?.staff_id, payrollRef.payroll_code])

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />

  const staff = staffItem
  const payroll = payrollRef
  const auditLogs = unwrapData(auditData)?.results || []

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[
        { label: 'Staff', href: '/staff' },
        { label: staff.full_name },
      ]} />
      <PageHeader
        title={staff.full_name}
        subtitle={[staff.employee_id, staff.designation_name, staff.department_name].filter(Boolean).join(' · ')}
        actions={
          <>
            <Link to={`/staff/${id}/edit`}><Button variant="secondary">Edit</Button></Link>
            <Button variant="outline" onClick={() => credentialsMut.mutate()} loading={credentialsMut.isPending}>
              <FiSend className="h-4 w-4" /> Send Credentials
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setTab(t.key); if (t.key === 'audit') refetchAudit() }}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${tab === t.key ? 'bg-primary text-white' : 'bg-slate-100 text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card>
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={staff.full_name} src={resolveMediaUrl(staff.photo_url)} size="lg" />
            <div>
              <p className="text-sm text-muted">Status</p>
              <p className="font-medium">{STATUS_LABELS[staff.status] || staff.status}</p>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Employee ID" value={staff.employee_id} />
            <Field label="Role" value={ROLE_LABELS[staff.staff_role_code] || staff.staff_role_code} />
            <Field label="Email" value={staff.email} />
            <Field label="Mobile" value={staff.mobile_number} />
            <Field label="Username" value={staff.username} />
            <Field label="Joining Date" value={staff.joining_date} />
            <Field label="Date of Birth" value={staff.date_of_birth} />
            <Field label="Gender" value={staff.gender} />
            <Field label="Address" value={staff.address} />
            <Field label="City" value={staff.city} />
            <Field label="Pincode" value={staff.pincode} />
            <Field label="Notes" value={staff.notes} />
          </dl>
        </Card>
      )}

      {tab === 'department' && (
        <Card>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Department" value={staff.department_name} />
            <Field label="Designation" value={staff.designation_name} />
            <Field label="Staff Role" value={ROLE_LABELS[staff.staff_role_code] || staff.staff_role_code} />
            <Field label="Joining Date" value={staff.joining_date} />
          </dl>
        </Card>
      )}

      {tab === 'shift' && (
        <Card title="Shift Schedule">
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Shift Name" value={shiftForm.shift_name} onChange={(e) => setShiftForm({ ...shiftForm, shift_name: e.target.value })} />
            <Input label="Start Time" type="time" value={shiftForm.start_time} onChange={(e) => setShiftForm({ ...shiftForm, start_time: e.target.value })} />
            <Input label="End Time" type="time" value={shiftForm.end_time} onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })} />
            <Button onClick={() => shiftMut.mutate()} loading={shiftMut.isPending}>Assign Shift</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted"><th className="py-2">Shift</th><th>Time</th><th>Weekdays</th><th>Current</th></tr></thead>
              <tbody>
                {(staff.shifts || []).map((s) => (
                  <tr key={s.shift_id} className="border-b">
                    <td className="py-2">{s.shift_name}</td>
                    <td>{s.start_time} – {s.end_time}</td>
                    <td>{(s.weekdays || []).join(', ')}</td>
                    <td>{s.is_current ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'attendance' && (
        <Card title="Attendance">
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Input label="Date" type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })} />
            <SelectField label="Status" value={attendanceForm.status} onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
              options={[{ label: 'Present', value: 'present' }, { label: 'Absent', value: 'absent' }, { label: 'Half Day', value: 'half_day' }, { label: 'Late', value: 'late' }, { label: 'On Leave', value: 'on_leave' }]} />
            <Button onClick={() => attendanceMut.mutate()} loading={attendanceMut.isPending}>Record</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted"><th className="py-2">Date</th><th>Status</th><th>Check In</th><th>Check Out</th></tr></thead>
              <tbody>
                {(staff.attendance_records || []).map((r) => (
                  <tr key={r.record_id} className="border-b">
                    <td className="py-2">{r.date}</td>
                    <td>{r.status}</td>
                    <td>{r.check_in || '—'}</td>
                    <td>{r.check_out || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'leave' && (
        <Card title="Leave">
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <SelectField label="Type" value={leaveForm.leave_type} onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })} options={TEACHER_LEAVE_TYPE_OPTIONS} />
            <Input label="Start" type="date" value={leaveForm.start_date} onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })} />
            <Input label="End" type="date" value={leaveForm.end_date} onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })} />
            <Input label="Reason" value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
            <Button onClick={() => leaveMut.mutate()} loading={leaveMut.isPending}>Submit</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b text-left text-muted"><th className="py-2">Type</th><th>Dates</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {(staff.leave_requests || []).map((l) => (
                  <tr key={l.leave_id} className="border-b">
                    <td className="py-2">{l.leave_type}</td>
                    <td>{l.start_date} – {l.end_date}</td>
                    <td>{l.status}</td>
                    <td>
                      {l.status === 'pending' && (
                        <Button size="sm" variant="outline" onClick={() => approveLeaveMut.mutate(l.leave_id)} loading={approveLeaveMut.isPending}>Approve</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'payroll' && (
        <Card title="Payroll Reference">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Payroll Code" value={payrollForm.payroll_code} onChange={(e) => setPayrollForm({ ...payrollForm, payroll_code: e.target.value })} />
            <Input label="Salary Grade" value={payrollForm.salary_grade} onChange={(e) => setPayrollForm({ ...payrollForm, salary_grade: e.target.value })} />
            <Input label="Basic Salary" type="number" value={payrollForm.basic_salary} onChange={(e) => setPayrollForm({ ...payrollForm, basic_salary: e.target.value })} />
            <Input label="Bank Name" value={payrollForm.bank_name} onChange={(e) => setPayrollForm({ ...payrollForm, bank_name: e.target.value })} />
            <Input label="Bank Account" value={payrollForm.bank_account} onChange={(e) => setPayrollForm({ ...payrollForm, bank_account: e.target.value })} />
            <Input label="PF Number" value={payrollForm.pf_number} onChange={(e) => setPayrollForm({ ...payrollForm, pf_number: e.target.value })} />
            <Input label="ESI Number" value={payrollForm.esi_number} onChange={(e) => setPayrollForm({ ...payrollForm, esi_number: e.target.value })} />
          </div>
          <div className="mt-4">
            <Button onClick={() => payrollMut.mutate()} loading={payrollMut.isPending}>Save Payroll</Button>
          </div>
        </Card>
      )}

      {tab === 'documents' && (
        <Card title="Documents">
          <div className="mb-6 flex flex-wrap items-end gap-3">
            <SelectField label="Type" value={docType} onChange={(e) => setDocType(e.target.value)}
              options={[{ label: 'ID Proof', value: 'id_proof' }, { label: 'Resume', value: 'resume' }, { label: 'Contract', value: 'contract' }, { label: 'Other', value: 'other' }]} />
            <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="text-sm" />
            <Button
              disabled={!docFile}
              loading={uploadMut.isPending}
              onClick={() => {
                const fd = new FormData()
                fd.append('file', docFile)
                fd.append('document_type', docType)
                uploadMut.mutate(fd)
              }}
            >
              Upload
            </Button>
          </div>
          <ul className="space-y-2 text-sm">
            {(staff.documents || []).map((d) => (
              <li key={d.document_id} className="flex justify-between border-b py-2">
                <span>{d.title || d.document_type}</span>
                {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" className="text-primary">Download</a>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'experience' && (
        <Card title="Experience">
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Organization" value={expForm.organization_name} onChange={(e) => setExpForm({ ...expForm, organization_name: e.target.value })} />
            <Input label="Role" value={expForm.role} onChange={(e) => setExpForm({ ...expForm, role: e.target.value })} />
            <Input label="Start Date" type="date" value={expForm.start_date} onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })} />
            <Button onClick={() => expMut.mutate()} loading={expMut.isPending}>Add</Button>
          </div>
          <ul className="space-y-2 text-sm">
            {(staff.experiences || []).map((e) => (
              <li key={e.experience_id} className="border-b py-2">
                <strong>{e.organization_name}</strong> — {e.role} ({e.start_date || '?'})
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'skills' && (
        <Card title="Skills">
          <div className="mb-6 grid gap-3 sm:grid-cols-3">
            <Input label="Skill" value={skillForm.skill_name} onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })} />
            <SelectField label="Level" value={skillForm.level} onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value })} options={STAFF_SKILL_LEVEL_OPTIONS} />
            <Button onClick={() => skillMut.mutate()} loading={skillMut.isPending}>Add Skill</Button>
          </div>
          <ul className="space-y-2 text-sm">
            {(staff.skills || []).map((s) => (
              <li key={s.skill_id} className="border-b py-2">{s.skill_name} — {s.level}</li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'emergency' && (
        <Card title="Emergency Contact">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Name" value={emergencyForm.emergency_contact_name} onChange={(e) => setEmergencyForm({ ...emergencyForm, emergency_contact_name: e.target.value })} />
            <Input label="Phone" value={emergencyForm.emergency_contact_phone} onChange={(e) => setEmergencyForm({ ...emergencyForm, emergency_contact_phone: e.target.value })} />
            <Input label="Relation" value={emergencyForm.emergency_contact_relation} onChange={(e) => setEmergencyForm({ ...emergencyForm, emergency_contact_relation: e.target.value })} />
          </div>
          <div className="mt-4">
            <Button onClick={() => emergencyMut.mutate()} loading={emergencyMut.isPending}>Save</Button>
          </div>
        </Card>
      )}

      {tab === 'credentials' && (
        <Card title="Login Credentials">
          <dl className="mb-6 grid gap-4 sm:grid-cols-2">
            <Field label="Username" value={staff.username} />
            <Field label="Email" value={staff.email} />
            <Field label="Mobile" value={staff.mobile_number} />
            <Field label="Viewable Password" value={staff.viewable_password} />
          </dl>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => credentialsMut.mutate()} loading={credentialsMut.isPending}>
              <FiSend className="h-4 w-4" /> Send Credentials
            </Button>
            <Button variant="secondary" onClick={() => resetMut.mutate()} loading={resetMut.isPending}>
              <FiRefreshCw className="h-4 w-4" /> Reset Password
            </Button>
          </div>
        </Card>
      )}

      {tab === 'audit' && (
        <Card title="Audit Logs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted">
                  <th className="py-2">Timestamp</th>
                  <th>Action</th>
                  <th>Table</th>
                  <th>User</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.audit_log_id} className="border-b">
                    <td className="py-2">{log.timestamp}</td>
                    <td>{log.action}</td>
                    <td>{log.table_name}</td>
                    <td>{log.user_name}</td>
                    <td>{log.ip_address || '—'}</td>
                  </tr>
                ))}
                {!auditLogs.length && (
                  <tr><td colSpan={5} className="py-4 text-center text-muted">No audit logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
