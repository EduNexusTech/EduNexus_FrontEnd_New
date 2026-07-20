import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiFileText,
  FiAward,
  FiLayers,
  FiDownload,
  FiPlus,
  FiShield,
  FiEdit3,
  FiPrinter,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { documentsService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const QUICK_LINKS = [
  { to: '/documents/designer', label: 'Template Designer', icon: FiEdit3, desc: 'Drag-drop blocks, board layouts' },
  { to: '/documents/generate', label: 'Generate Reports', icon: FiPrinter, desc: 'From published assessment snapshots' },
  { to: '/documents/certificates', label: 'Certificates', icon: FiAward, desc: 'TC, bonafide, merit & custom' },
  { to: '/documents/verify', label: 'QR Verify', icon: FiShield, desc: 'Public document verification' },
]

const BOARD_FORMATS = [
  { value: 'cbse', label: 'CBSE' },
  { value: 'icse', label: 'ICSE' },
  { value: 'ib', label: 'IB' },
  { value: 'igcse', label: 'IGCSE' },
  { value: 'state_board', label: 'State Board' },
  { value: 'custom', label: 'Custom' },
]

export default function DocumentsHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const dashQuery = useQuery({
    queryKey: ['documents-dashboard', schoolId],
    queryFn: () => documentsService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents & Report Cards"
        description="Enterprise Document Template Engine — report cards, transcripts, certificates. Consumes published assessment snapshots only; never recalculates marks."
        actions={
          <Link to="/documents/generate">
            <Button variant="primary"><FiPrinter className="h-4 w-4" /> Generate</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Templates" value={String(dash.total_templates ?? '—')} icon={FiLayers} />
        <StatCard title="Published Templates" value={String(dash.published_templates ?? '—')} icon={FiFileText} color="success" />
        <StatCard title="Generated Docs" value={String(dash.generated_documents ?? '—')} icon={FiPrinter} />
        <StatCard title="Certificates Issued" value={String(dash.certificates_issued ?? '—')} icon={FiAward} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_LINKS.map((item) => (
          <Link key={item.to} to={item.to} className="block">
            <Card className="h-full p-4 transition hover:border-primary-300">
              <div className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-5 w-5 text-primary-600" />
                <div>
                  <div className="font-medium text-slate-900">{item.label}</div>
                  <div className="text-sm text-slate-500">{item.desc}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-4 border-l-4 border-primary-500 bg-primary-50/30">
        <p className="text-sm text-slate-700">
          <strong>Assessment boundary:</strong> Documents read <code className="text-xs">PublishedResultSnapshot</code> from
          the Assessment Engine. Publish results under Examinations → Results before generating report cards.
        </p>
      </Card>
    </div>
  )
}

const DESIGNER_BLOCKS = [
  { type: 'header', label: 'Header' },
  { type: 'student_photo', label: 'Student Photo' },
  { type: 'subject_marks', label: 'Subject Marks Table' },
  { type: 'grade_distribution', label: 'Grade Chart' },
  { type: 'attendance_summary', label: 'Attendance' },
  { type: 'teacher_remarks', label: 'Teacher Remarks' },
  { type: 'signature_principal', label: 'Principal Signature' },
  { type: 'qr_code', label: 'QR Verification' },
  { type: 'watermark', label: 'Watermark' },
  { type: 'html_block', label: 'HTML Block' },
]

export function DocumentDesignerPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [boardFormat, setBoardFormat] = useState('cbse')
  const [blocks, setBlocks] = useState([])

  const createMut = useMutation({
    mutationFn: () => documentsService.createTemplate({
      name,
      code,
      board_format: boardFormat,
      doc_type: 'report_card',
      layout_json: { blocks, page: { size: 'A4', orientation: 'portrait' } },
      ...(schoolId ? { school_id: schoolId } : {}),
    }),
    onSuccess: () => {
      toast.success('Template draft created')
      setName('')
      setCode('')
      setBlocks([])
      qc.invalidateQueries({ queryKey: ['documents-dashboard'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const addBlock = (type) => {
    setBlocks((prev) => [...prev, { id: `b${prev.length + 1}`, type, props: {} }])
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Template Designer"
        description="Drag-and-drop document blocks. Assign by board, year, section. Publish before bulk generation."
        actions={<Link to="/documents"><Button variant="secondary">Back</Button></Link>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Blocks</h3>
          <div className="flex flex-wrap gap-2">
            {DESIGNER_BLOCKS.map((b) => (
              <Button key={b.type} variant="secondary" size="sm" onClick={() => addBlock(b.type)}>
                <FiPlus className="h-3 w-3" /> {b.label}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2 min-h-[320px]">
          <h3 className="mb-3 font-semibold">Canvas (A4 Portrait)</h3>
          {blocks.length === 0 ? (
            <p className="text-sm text-slate-400">Add blocks from the palette to build your layout.</p>
          ) : (
            <ul className="space-y-2">
              {blocks.map((b, i) => (
                <li key={b.id} className="flex items-center justify-between rounded border border-dashed border-slate-200 p-3 text-sm">
                  <span>{DESIGNER_BLOCKS.find((x) => x.type === b.type)?.label || b.type}</span>
                  <Button variant="ghost" size="sm" onClick={() => setBlocks((p) => p.filter((_, j) => j !== i))}>Remove</Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-4 space-y-4">
        <h3 className="font-semibold">Save Template</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="CBSE Term 1 Report" />
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="cbse-term1" />
          <SelectField label="Board Format" value={boardFormat} onChange={(e) => setBoardFormat(e.target.value)}>
            {BOARD_FORMATS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </SelectField>
        </div>
        <Button
          variant="primary"
          disabled={!name || !code || createMut.isPending}
          onClick={() => createMut.mutate()}
        >
          Save Draft Template
        </Button>
      </Card>
    </div>
  )
}

export function DocumentGeneratePage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const [snapshotId, setSnapshotId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [templateId, setTemplateId] = useState('')

  const snapshotsQuery = useQuery({
    queryKey: ['published-snapshots-gen', schoolId],
    queryFn: () => import('@/api/services').then((m) =>
      m.assessmentsService.publishedSnapshots(schoolId ? { school: schoolId } : {}),
    ),
    enabled: Boolean(schoolId),
  })
  const templatesQuery = useQuery({
    queryKey: ['doc-templates', schoolId],
    queryFn: () => documentsService.templates(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId),
  })

  const snapshots = useMemo(() => unwrap(snapshotsQuery.data).results || [], [snapshotsQuery.data])
  const templates = useMemo(() => unwrap(templatesQuery.data).results || [], [templatesQuery.data])

  const genMut = useMutation({
    mutationFn: () => documentsService.generateReportCard({
      snapshot_id: snapshotId,
      student_id: studentId,
      template_id: templateId || undefined,
      ...(schoolId ? { school_id: schoolId } : {}),
    }),
    onSuccess: (res) => {
      const d = unwrap(res)
      toast.success(`Report card generated — ${d.title || 'OK'}`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const onSnapshotPick = (id) => {
    setSnapshotId(id)
    const snap = snapshots.find((s) => s.id === id)
    if (snap?.student) setStudentId(snap.student)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Report Card"
        description="Select a published assessment snapshot. Marks are never recalculated here."
        actions={<Link to="/documents"><Button variant="secondary">Back</Button></Link>}
      />

      <Card className="p-4 space-y-4 max-w-xl">
        <SelectField label="Published Snapshot" value={snapshotId} onChange={(e) => onSnapshotPick(e.target.value)}>
          <option value="">Select snapshot</option>
          {snapshots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.admission_number} — {s.payload?.exam_name || 'Exam'} (v{s.snapshot_version})
            </option>
          ))}
        </SelectField>
        <SelectField label="Template (optional)" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          <option value="">Auto-resolve / default</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.name} ({t.board_format})</option>
          ))}
        </SelectField>
        <Button
          variant="primary"
          disabled={!snapshotId || !studentId || genMut.isPending}
          onClick={() => genMut.mutate()}
        >
          Generate PDF Report Card
        </Button>
      </Card>
    </div>
  )
}

export function DocumentCertificatesPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const [studentId, setStudentId] = useState('')
  const [certType, setCertType] = useState('certificate_bonafide')

  const issueMut = useMutation({
    mutationFn: () => documentsService.issueCertificate({
      student_id: studentId,
      cert_type: certType,
      ...(schoolId ? { school_id: schoolId } : {}),
    }),
    onSuccess: () => toast.success('Certificate issued'),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Transfer, bonafide, character, merit, participation & custom certificates."
        actions={<Link to="/documents"><Button variant="secondary">Back</Button></Link>}
      />
      <Card className="p-4 space-y-4 max-w-xl">
        <Input label="Student ID (UUID)" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <SelectField label="Certificate Type" value={certType} onChange={(e) => setCertType(e.target.value)}>
          <option value="certificate_bonafide">Bonafide</option>
          <option value="certificate_transfer">Transfer Certificate</option>
          <option value="certificate_character">Character</option>
          <option value="certificate_merit">Merit</option>
          <option value="certificate_participation">Participation</option>
          <option value="certificate_study">Study Certificate</option>
        </SelectField>
        <Button variant="primary" disabled={!studentId || issueMut.isPending} onClick={() => issueMut.mutate()}>
          Issue Certificate
        </Button>
      </Card>
    </div>
  )
}

export function DocumentVerifyPage() {
  const [code, setCode] = useState('')
  const verifyQuery = useQuery({
    queryKey: ['doc-verify', code],
    queryFn: () => documentsService.verify(code),
    enabled: code.length > 30,
  })
  const result = useMemo(() => (verifyQuery.data ? unwrap(verifyQuery.data) : null), [verifyQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Document Verification"
        description="Verify report cards, certificates, and transcripts via secure QR code."
        actions={<Link to="/documents"><Button variant="secondary">Back</Button></Link>}
      />
      <Card className="p-4 space-y-4 max-w-xl">
        <Input
          label="Verification Code (UUID from QR)"
          value={code}
          onChange={(e) => setCode(e.target.value.trim())}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        />
        {verifyQuery.isFetching && <p className="text-sm text-slate-500">Verifying…</p>}
        {result && (
          <div className={`rounded p-4 text-sm ${result.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {result.valid ? (
              <>
                <p className="font-semibold">Valid document</p>
                <p>Type: {result.doc_type}</p>
                <p>Student: {result.student}</p>
                <p>School: {result.school}</p>
              </>
            ) : (
              <p>{result.message || 'Invalid document'}</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
