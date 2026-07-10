import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiCreditCard, FiDownload, FiRefreshCw } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState, Avatar } from '@/components/ui/Feedback'
import { studentService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { STUDENT_STATUS_OPTIONS } from '@/config/constants'
import { resolveMediaUrl } from '@/utils/format'

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'admission', label: 'Admission' },
  { key: 'academic', label: 'Academic' },
  { key: 'transport', label: 'Transport' },
  { key: 'hostel', label: 'Hostel' },
  { key: 'medical', label: 'Medical' },
  { key: 'documents', label: 'Documents' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'siblings', label: 'Siblings' },
  { key: 'promotion', label: 'Promotion' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'idcard', label: 'ID Card' },
]

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text">{value || '—'}</dd>
    </div>
  )
}

export default function StudentDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('profile')
  const [transportForm, setTransportForm] = useState({})
  const [hostelForm, setHostelForm] = useState({})
  const [medicalForm, setMedicalForm] = useState({})
  const [achievementForm, setAchievementForm] = useState({ title: '', category: '' })
  const [docFile, setDocFile] = useState(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['students', id],
    queryFn: () => studentService.get(id),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['students', id] })
    refetch()
  }

  const qrMutation = useMutation({
    mutationFn: () => studentService.regenerateQr(id),
    onSuccess: () => { invalidate(); toast.success('QR code regenerated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const idCardQuery = useQuery({
    queryKey: ['students', id, 'id-card'],
    queryFn: () => studentService.idCard(id),
    enabled: tab === 'idcard',
  })

  const statusMutation = useMutation({
    mutationFn: (payload) => studentService.updateStatus(id, payload),
    onSuccess: () => { invalidate(); toast.success('Status updated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const transportMut = useMutation({
    mutationFn: () => studentService.updateTransport(id, transportForm),
    onSuccess: () => { invalidate(); toast.success('Transport saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const hostelMut = useMutation({
    mutationFn: () => studentService.updateHostel(id, hostelForm),
    onSuccess: () => { invalidate(); toast.success('Hostel saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const medicalMut = useMutation({
    mutationFn: () => studentService.updateMedical(id, medicalForm),
    onSuccess: () => { invalidate(); toast.success('Medical saved') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const achievementMut = useMutation({
    mutationFn: () => studentService.addAchievement(id, achievementForm),
    onSuccess: () => { invalidate(); setAchievementForm({ title: '', category: '' }); toast.success('Achievement added') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const uploadMut = useMutation({
    mutationFn: (fd) => studentService.uploadDocument(id, fd),
    onSuccess: () => { invalidate(); setDocFile(null); toast.success('Document uploaded') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />

  const student = unwrapData(data)
  const idCard = unwrapData(idCardQuery.data)?.data || unwrapData(idCardQuery.data) || student.id_card || {}

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[
        { label: 'Students', href: '/students' },
        { label: student.full_name },
      ]} />
      <PageHeader
        title={student.full_name}
        subtitle={[student.admission_number, student.roll_number, student.class_name].filter(Boolean).join(' · ')}
        actions={
          <>
            <Link to={`/students/${id}/edit`}><Button variant="secondary">Edit</Button></Link>
            <Button variant="outline" onClick={() => qrMutation.mutate()} loading={qrMutation.isPending}>
              <FiRefreshCw className="h-4 w-4" /> QR
            </Button>
            <Button variant="outline" onClick={() => setTab('idcard')}>
              <FiCreditCard className="h-4 w-4" /> ID Card
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
            <Avatar name={student.full_name} src={resolveMediaUrl(student.photo_url)} size="lg" />
            <div>
              <SelectField
                label="Status"
                value={student.status}
                options={STUDENT_STATUS_OPTIONS}
                onChange={(e) => statusMutation.mutate({ status: e.target.value })}
              />
            </div>
          </div>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Username" value={student.username} />
            <Field label="Email" value={student.email} />
            <Field label="Mobile" value={student.mobile_number} />
            <Field label="Date of Birth" value={student.date_of_birth} />
            <Field label="Gender" value={student.gender} />
            <Field label="Blood Group" value={student.blood_group} />
            <Field label="Address" value={student.address} />
            <Field label="City" value={student.city} />
            <Field label="Previous School" value={student.previous_school} />
            <Field label="Emergency Contact" value={`${student.emergency_contact_name || ''} ${student.emergency_contact_phone || ''}`} />
          </dl>
        </Card>
      )}

      {tab === 'admission' && (
        <Card>
          {student.admission_details ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <Field label="Admission Number" value={student.admission_details.admission_number} />
              <Field label="Application Date" value={student.admission_details.application_date} />
              <Field label="Enrolled At" value={student.admission_details.enrolled_at} />
              <Field label="Fee Amount" value={student.admission_details.fee_amount} />
              <Field label="Fee Paid" value={student.admission_details.fee_paid} />
            </dl>
          ) : (
            <p className="text-sm text-muted">No linked admission application.</p>
          )}
        </Card>
      )}

      {tab === 'academic' && (
        <Card>
          <h3 className="mb-4 font-semibold">Current Enrollment</h3>
          {student.current_enrollment ? (
            <dl className="grid gap-4 sm:grid-cols-2 mb-6">
              <Field label="Academic Year" value={student.current_enrollment.academic_year_name} />
              <Field label="Class" value={student.current_enrollment.class_name} />
              <Field label="Section" value={student.current_enrollment.section_name} />
              <Field label="Roll Number" value={student.current_enrollment.roll_number} />
            </dl>
          ) : null}
          <h3 className="mb-2 font-semibold text-sm">Enrollment History</h3>
          <ul className="space-y-2 text-sm">
            {(student.enrollments || []).map((e) => (
              <li key={e.enrollment_id} className="rounded-lg border border-border px-3 py-2">
                {e.academic_year_name} — {e.class_name} {e.section_name} (Roll: {e.roll_number || '—'})
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'transport' && (
        <Card>
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
            <Input label="Route" defaultValue={student.transport_detail?.route_name} onChange={(e) => setTransportForm((p) => ({ ...p, route_name: e.target.value }))} />
            <Input label="Vehicle" defaultValue={student.transport_detail?.vehicle_number} onChange={(e) => setTransportForm((p) => ({ ...p, vehicle_number: e.target.value }))} />
            <Input label="Pickup" defaultValue={student.transport_detail?.pickup_point} onChange={(e) => setTransportForm((p) => ({ ...p, pickup_point: e.target.value }))} />
            <Input label="Drop" defaultValue={student.transport_detail?.drop_point} onChange={(e) => setTransportForm((p) => ({ ...p, drop_point: e.target.value }))} />
          </div>
          <Button className="mt-4" loading={transportMut.isPending} onClick={() => transportMut.mutate()}>Save Transport</Button>
        </Card>
      )}

      {tab === 'hostel' && (
        <Card>
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
            <Input label="Hostel" defaultValue={student.hostel_detail?.hostel_name} onChange={(e) => setHostelForm((p) => ({ ...p, hostel_name: e.target.value }))} />
            <Input label="Room" defaultValue={student.hostel_detail?.room_number} onChange={(e) => setHostelForm((p) => ({ ...p, room_number: e.target.value }))} />
            <Input label="Block" defaultValue={student.hostel_detail?.block} onChange={(e) => setHostelForm((p) => ({ ...p, block: e.target.value }))} />
          </div>
          <Button className="mt-4" loading={hostelMut.isPending} onClick={() => hostelMut.mutate()}>Save Hostel</Button>
        </Card>
      )}

      {tab === 'medical' && (
        <Card>
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl">
            <Input label="Allergies" defaultValue={student.medical_detail?.allergies} onChange={(e) => setMedicalForm((p) => ({ ...p, allergies: e.target.value }))} />
            <Input label="Chronic Conditions" defaultValue={student.medical_detail?.chronic_conditions} onChange={(e) => setMedicalForm((p) => ({ ...p, chronic_conditions: e.target.value }))} />
            <Input label="Doctor" defaultValue={student.medical_detail?.doctor_name} onChange={(e) => setMedicalForm((p) => ({ ...p, doctor_name: e.target.value }))} />
          </div>
          <Button className="mt-4" loading={medicalMut.isPending} onClick={() => medicalMut.mutate()}>Save Medical</Button>
        </Card>
      )}

      {tab === 'documents' && (
        <Card>
          <div className="mb-4 flex gap-2 items-center">
            <input type="file" onChange={(e) => setDocFile(e.target.files?.[0])} className="text-sm" />
            <Button
              variant="outline"
              disabled={!docFile}
              loading={uploadMut.isPending}
              onClick={() => {
                const fd = new FormData()
                fd.append('file', docFile)
                fd.append('document_type', 'other')
                uploadMut.mutate(fd)
              }}
            >
              Upload
            </Button>
          </div>
          <ul className="space-y-2">
            {(student.documents || []).map((d) => (
              <li key={d.document_id} className="flex justify-between rounded-lg border px-3 py-2 text-sm">
                <span>{d.document_type} — {d.title || 'Document'}</span>
                {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" className="text-primary">View</a>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'achievements' && (
        <Card>
          <div className="mb-4 flex gap-2 max-w-xl">
            <Input placeholder="Title" value={achievementForm.title} onChange={(e) => setAchievementForm((p) => ({ ...p, title: e.target.value }))} />
            <Button loading={achievementMut.isPending} onClick={() => achievementMut.mutate()}>Add</Button>
          </div>
          <ul className="space-y-2 text-sm">
            {(student.achievements || []).map((a) => (
              <li key={a.achievement_id} className="rounded-lg border px-3 py-2">{a.title} {a.category ? `(${a.category})` : ''}</li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'discipline' && (
        <Card>
          <ul className="space-y-2 text-sm">
            {(student.discipline_records || []).map((r) => (
              <li key={r.record_id} className="rounded-lg border px-3 py-2">
                {r.incident_date} — {r.category} ({r.severity}): {r.description}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'siblings' && (
        <Card>
          <ul className="space-y-2 text-sm">
            {(student.sibling_links || []).map((s) => (
              <li key={s.sibling_id} className="rounded-lg border px-3 py-2">
                {s.sibling_name} ({s.sibling_admission_number})
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'promotion' && (
        <Card>
          <ul className="space-y-2 text-sm">
            {(student.promotion_history || []).map((p) => (
              <li key={p.promotion_id} className="rounded-lg border px-3 py-2">
                {p.from_class_name} → {p.to_class_name} ({p.promoted_on || '—'})
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'certificates' && (
        <Card>
          <ul className="space-y-2 text-sm">
            {(student.certificates || []).map((c) => (
              <li key={c.certificate_id} className="rounded-lg border px-3 py-2">
                {c.certificate_type} — {c.certificate_number || 'No number'}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === 'idcard' && (
        <Card>
          <div className="mx-auto max-w-sm rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase text-primary">{idCard.school_name}</p>
              <div className="mx-auto my-4">
                <Avatar name={idCard.full_name} src={resolveMediaUrl(idCard.photo_url)} size="lg" />
              </div>
              <p className="text-lg font-bold text-text">{idCard.full_name}</p>
              <p className="text-xs text-muted">{idCard.class_name} {idCard.section_name}</p>
              <p className="mt-2 font-mono text-sm">Adm: {idCard.admission_number}</p>
              <p className="font-mono text-sm">Roll: {idCard.roll_number}</p>
              {idCard.qr_code_url && (
                <img src={idCard.qr_code_url} alt="QR" className="mx-auto mt-4 h-24 w-24" />
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <Button variant="outline" onClick={() => window.print()}><FiDownload /> Print</Button>
          </div>
        </Card>
      )}
    </div>
  )
}
