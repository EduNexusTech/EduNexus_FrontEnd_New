import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiKey, FiRefreshCw, FiSend, FiSmartphone } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField, CheckboxField } from '@/components/ui/Input'
import { PageLoader, ErrorState, Avatar } from '@/components/ui/Feedback'
import { parentService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import {
  PARENT_COMMUNICATION_OPTIONS,
  PARENT_EDUCATION_OPTIONS,
  PARENT_INCOME_RANGE_OPTIONS,
} from '@/config/constants'
import { resolveMediaUrl } from '@/utils/format'

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'occupation', label: 'Occupation & Income' },
  { key: 'education', label: 'Education' },
  { key: 'emergency', label: 'Emergency Contact' },
  { key: 'guardian', label: 'Guardian' },
  { key: 'students', label: 'Linked Students' },
  { key: 'communication', label: 'Communication' },
  { key: 'credentials', label: 'Credentials' },
  { key: 'mobileApp', label: 'Mobile App' },
]

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text">{value || '—'}</dd>
    </div>
  )
}

export default function ParentDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('profile')

  const [linkForm, setLinkForm] = useState({ student_id: '', relation: 'Parent', is_primary: false })
  const [commForm, setCommForm] = useState({})
  const [emergencyForm, setEmergencyForm] = useState({})
  const [guardianForm, setGuardianForm] = useState({})

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parents', id],
    queryFn: () => parentService.get(id),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['parents', id] })
    refetch()
  }

  const linkMut = useMutation({
    mutationFn: () => parentService.linkStudent(id, linkForm),
    onSuccess: () => { invalidate(); setLinkForm({ student_id: '', relation: 'Parent', is_primary: false }); toast.success('Student linked') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const unlinkMut = useMutation({
    mutationFn: (studentId) => parentService.unlinkStudent(id, { student_id: studentId }),
    onSuccess: () => { invalidate(); toast.success('Student unlinked') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const commMut = useMutation({
    mutationFn: () => parentService.updateCommunication(id, commForm),
    onSuccess: () => { invalidate(); toast.success('Communication preferences saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const emergencyMut = useMutation({
    mutationFn: () => parentService.updateEmergencyContact(id, emergencyForm),
    onSuccess: () => { invalidate(); toast.success('Emergency contact saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const guardianMut = useMutation({
    mutationFn: () => parentService.updateGuardian(id, guardianForm),
    onSuccess: () => { invalidate(); toast.success('Guardian details saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const credentialsMut = useMutation({
    mutationFn: () => parentService.sendCredentials(id, { send_email: true, send_sms: true }),
    onSuccess: () => toast.success('Credentials sent'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const resetMut = useMutation({
    mutationFn: () => parentService.resetPassword(id, { send_credentials: true }),
    onSuccess: () => { invalidate(); toast.success('Password reset and sent') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const mobileMut = useMutation({
    mutationFn: (enabled) => parentService.setMobileAppAccess(id, { mobile_app_access: enabled }),
    onSuccess: () => { invalidate(); toast.success('Mobile app access updated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />

  const parent = unwrapData(data)
  const incomeLabel = PARENT_INCOME_RANGE_OPTIONS.find((o) => o.value === parent.income_range)?.label
  const eduLabel = PARENT_EDUCATION_OPTIONS.find((o) => o.value === parent.education)?.label
  const commLabel = PARENT_COMMUNICATION_OPTIONS.find((o) => o.value === parent.communication_preference)?.label

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[
        { label: 'Parents', href: '/parents' },
        { label: parent.full_name },
      ]} />
      <PageHeader
        title={parent.full_name}
        subtitle={[parent.parent_code, parent.occupation].filter(Boolean).join(' · ')}
        actions={
          <>
            <Link to={`/parents/${id}/edit`}><Button variant="secondary">Edit</Button></Link>
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
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium ${tab === t.key ? 'bg-primary text-white' : 'bg-slate-100 text-muted'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <Card>
          <div className="mb-6 flex items-center gap-4">
            <Avatar name={parent.full_name} src={resolveMediaUrl(parent.photo_url)} size="lg" />
            <div>
              <p className="text-sm text-muted">Status</p>
              <p className="font-medium">{parent.status_display || parent.status}</p>
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Username" value={parent.username} />
            <Field label="Email" value={parent.email} />
            <Field label="Mobile" value={parent.mobile_number} />
            <Field label="Date of Birth" value={parent.date_of_birth} />
            <Field label="Gender" value={parent.gender} />
            <Field label="Address" value={parent.address} />
            <Field label="City" value={parent.city} />
            <Field label="Pincode" value={parent.pincode} />
            <Field label="Notes" value={parent.notes} />
          </dl>
        </Card>
      )}

      {tab === 'occupation' && (
        <Card>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Occupation" value={parent.occupation} />
            <Field label="Employer" value={parent.employer} />
            <Field label="Income Range" value={incomeLabel || parent.income_range} />
            <Field label="Annual Income" value={parent.annual_income} />
          </dl>
        </Card>
      )}

      {tab === 'education' && (
        <Card>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="Education Level" value={eduLabel || parent.education} />
            <Field label="Details" value={parent.education_details} />
          </dl>
        </Card>
      )}

      {tab === 'emergency' && (
        <Card>
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mb-4">
            <Input label="Name" defaultValue={parent.emergency_contact_name} onChange={(e) => setEmergencyForm((p) => ({ ...p, emergency_contact_name: e.target.value }))} />
            <Input label="Phone" defaultValue={parent.emergency_contact_phone} onChange={(e) => setEmergencyForm((p) => ({ ...p, emergency_contact_phone: e.target.value }))} />
            <Input label="Relation" defaultValue={parent.emergency_contact_relation} onChange={(e) => setEmergencyForm((p) => ({ ...p, emergency_contact_relation: e.target.value }))} />
          </div>
          <Button loading={emergencyMut.isPending} onClick={() => emergencyMut.mutate()}>Save Emergency Contact</Button>
        </Card>
      )}

      {tab === 'guardian' && (
        <Card>
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mb-4">
            <Input label="Guardian Name" defaultValue={parent.guardian_name} onChange={(e) => setGuardianForm((p) => ({ ...p, guardian_name: e.target.value }))} />
            <Input label="Relation" defaultValue={parent.guardian_relation} onChange={(e) => setGuardianForm((p) => ({ ...p, guardian_relation: e.target.value }))} />
            <Input label="Phone" defaultValue={parent.guardian_phone} onChange={(e) => setGuardianForm((p) => ({ ...p, guardian_phone: e.target.value }))} />
            <Input label="Address" defaultValue={parent.guardian_address} onChange={(e) => setGuardianForm((p) => ({ ...p, guardian_address: e.target.value }))} className="sm:col-span-2" />
          </div>
          <Button loading={guardianMut.isPending} onClick={() => guardianMut.mutate()}>Save Guardian</Button>
        </Card>
      )}

      {tab === 'students' && (
        <Card>
          <div className="mb-4 grid gap-2 sm:grid-cols-3 max-w-3xl">
            <Input placeholder="Student UUID" value={linkForm.student_id} onChange={(e) => setLinkForm((p) => ({ ...p, student_id: e.target.value }))} />
            <Input placeholder="Relation (Father/Mother)" value={linkForm.relation} onChange={(e) => setLinkForm((p) => ({ ...p, relation: e.target.value }))} />
            <Button loading={linkMut.isPending} onClick={() => linkMut.mutate()}>Link Student</Button>
          </div>
          <ul className="space-y-2 text-sm">
            {(parent.linked_students || []).map((s) => (
              <li key={s.link_id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div>
                  <Link to={`/students/${s.student_id}`} className="font-medium text-primary hover:underline">
                    {s.student_name}
                  </Link>
                  <span className="text-muted"> — {s.admission_number} · {s.class_name} {s.section_name} ({s.relation})</span>
                </div>
                <Button size="sm" variant="outline" loading={unlinkMut.isPending} onClick={() => unlinkMut.mutate(s.student_id)}>
                  Unlink
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'communication' && (
        <Card>
          <div className="grid gap-3 sm:grid-cols-2 max-w-xl mb-4">
            <SelectField
              label="Preferred Channel"
              defaultValue={parent.communication_preference}
              options={PARENT_COMMUNICATION_OPTIONS}
              onChange={(e) => setCommForm((p) => ({ ...p, communication_preference: e.target.value }))}
            />
            <Input label="Language" defaultValue={parent.preferred_language} onChange={(e) => setCommForm((p) => ({ ...p, preferred_language: e.target.value }))} />
            <CheckboxField label="Receive Email" defaultChecked={parent.receive_email} onChange={(e) => setCommForm((p) => ({ ...p, receive_email: e.target.checked }))} />
            <CheckboxField label="Receive SMS" defaultChecked={parent.receive_sms} onChange={(e) => setCommForm((p) => ({ ...p, receive_sms: e.target.checked }))} />
            <CheckboxField label="Receive Push" defaultChecked={parent.receive_push} onChange={(e) => setCommForm((p) => ({ ...p, receive_push: e.target.checked }))} />
          </div>
          <p className="mb-4 text-sm text-muted">Current: {commLabel || parent.communication_preference}</p>
          <Button loading={commMut.isPending} onClick={() => commMut.mutate()}>Save Preferences</Button>
        </Card>
      )}

      {tab === 'credentials' && (
        <Card>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-slate-50 p-4 max-w-md mb-4">
            <FiKey className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-medium">Login credentials</p>
              <p className="font-mono text-sm">Username: {parent.username || '—'}</p>
              <p className="font-mono text-sm">Password: {parent.viewable_password || '—'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button loading={credentialsMut.isPending} onClick={() => credentialsMut.mutate()}>
              <FiSend className="h-4 w-4" /> Send credentials
            </Button>
            <Button variant="outline" loading={resetMut.isPending} onClick={() => resetMut.mutate()}>
              <FiRefreshCw className="h-4 w-4" /> Reset password & send
            </Button>
          </div>
        </Card>
      )}

      {tab === 'mobileApp' && (
        <Card>
          <div className="flex items-center gap-4 max-w-md">
            <FiSmartphone className="h-10 w-10 text-primary" />
            <div className="flex-1">
              <p className="font-medium">Mobile App Access</p>
              <p className="text-sm text-muted">
                {parent.mobile_app_access ? 'Enabled' : 'Disabled'}
                {parent.mobile_app_enabled_at ? ` · since ${parent.mobile_app_enabled_at}` : ''}
              </p>
            </div>
            <Button
              variant={parent.mobile_app_access ? 'outline' : 'primary'}
              loading={mobileMut.isPending}
              onClick={() => mobileMut.mutate(!parent.mobile_app_access)}
            >
              {parent.mobile_app_access ? 'Disable Access' : 'Enable Access'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
