import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiClipboard,
  FiFileText,
  FiBarChart2,
  FiCheckCircle,
  FiDownload,
  FiPlus,
  FiUsers,
  FiAward,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { assessmentsService, academicYearService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { downloadBlob } from '@/utils/format'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

function normalizeList(payload) {
  const d = unwrap(payload)
  if (Array.isArray(d)) return d
  if (Array.isArray(d?.results)) return d.results
  return []
}

function normalizeYears(payload) {
  const raw = payload?.data?.results ?? payload?.results ?? normalizeList(payload)
  return Array.isArray(raw) ? raw : []
}

const QUICK_LINKS = [
  { to: '/examinations/marks', label: 'Marks Entry', icon: FiClipboard, desc: 'Enter & approve marks' },
  { to: '/examinations/results', label: 'Results', icon: FiAward, desc: 'Process & publish snapshots' },
  { to: '/academics/grading-schemes', label: 'Grading Schemes', icon: FiBarChart2, desc: 'Academic foundation SoT' },
  { to: '/students', label: 'Students', icon: FiUsers, desc: 'SIS identity SoT' },
]

export default function AssessmentsHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [yearId, setYearId] = useState('')

  const dashQuery = useQuery({
    queryKey: ['assessments-dashboard', schoolId],
    queryFn: () => assessmentsService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const examsQuery = useQuery({
    queryKey: ['assessments-exams', schoolId],
    queryFn: () => assessmentsService.exams(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const yearsQuery = useQuery({
    queryKey: ['academic-years-asm', schoolId],
    queryFn: () => academicYearService.list(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId),
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])
  const exams = useMemo(() => normalizeList(examsQuery.data), [examsQuery.data])
  const years = useMemo(() => normalizeYears(yearsQuery.data), [yearsQuery.data])

  const createMut = useMutation({
    mutationFn: () => assessmentsService.createExam({
      name,
      code,
      academic_year_id: yearId,
      ...(schoolId ? { school_id: schoolId } : {}),
    }),
    onSuccess: () => {
      toast.success('Exam created (draft)')
      setName('')
      setCode('')
      qc.invalidateQueries({ queryKey: ['assessments-dashboard'] })
      qc.invalidateQueries({ queryKey: ['assessments-exams'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Examination & Assessment"
        description="Enterprise assessment engine — exam master, marks, moderation, result processing & published snapshots. Report cards consume snapshots only (not built here)."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/examinations/marks">
              <Button variant="primary"><FiClipboard className="h-4 w-4" /> Marks</Button>
            </Link>
            <Button
              variant="excel"
              onClick={async () => {
                const first = exams[0]
                if (!first?.id) {
                  toast.error('Create an exam first')
                  return
                }
                const blob = await assessmentsService.exportMarks({
                  school: schoolId,
                  exam: first.id,
                })
                downloadBlob(blob, `marks-${first.code || 'export'}.csv`)
                toast.success('Export downloaded')
              }}
            >
              <FiDownload className="h-4 w-4" /> Export Marks
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Exams" value={String(dash.total_exams ?? '—')} icon={FiFileText} />
        <StatCard title="Marks Entry Open" value={String(dash.marks_entry_open ?? '—')} icon={FiClipboard} color="warning" />
        <StatCard title="Pending Approval" value={String(dash.pending_approval ?? '—')} icon={FiCheckCircle} />
        <StatCard title="Results Published" value={String(dash.results_published ?? '—')} icon={FiBarChart2} color="success" />
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

      <Card className="p-4 space-y-4">
        <h3 className="font-semibold text-slate-900">Create Exam (Draft)</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Term 1 Examination" />
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="TERM1" />
          <SelectField
            label="Academic Year"
            value={yearId}
            onChange={(e) => setYearId(e.target.value)}
            placeholder="Select year"
            options={years.map((y) => ({ value: y.id, label: y.name }))}
          />
          <div className="flex items-end">
            <Button
              variant="primary"
              disabled={!name || !code || !yearId || createMut.isPending}
              onClick={() => createMut.mutate()}
            >
              <FiPlus className="h-4 w-4" /> Create
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-3 font-semibold text-slate-900">Recent Exams</h3>
        {exams.length === 0 ? (
          <p className="text-sm text-slate-500">No exams yet. Create one above or from an assessment template in Academics.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {exams.slice(0, 8).map((ex) => (
              <li key={ex.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span className="font-medium">{ex.name} <span className="text-slate-400">({ex.code})</span></span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs capitalize">{ex.status?.replace(/_/g, ' ')}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export function AssessmentsMarksPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const [examId, setExamId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [marks, setMarks] = useState('')

  const examsQuery = useQuery({
    queryKey: ['assessments-exams-marks', schoolId],
    queryFn: () => assessmentsService.exams(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId),
  })
  const exams = useMemo(() => normalizeList(examsQuery.data), [examsQuery.data])

  const enterMut = useMutation({
    mutationFn: () => assessmentsService.enterMarks({
      exam_id: examId,
      student_id: studentId,
      subject_id: subjectId,
      marks_obtained: marks,
      ...(schoolId ? { school_id: schoolId } : {}),
    }),
    onSuccess: () => {
      toast.success('Marks saved (draft)')
      setMarks('')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marks Entry"
        description="Enter marks per student/subject. Submit and approve via API workflow; bulk import via CSV on the hub."
        actions={<Link to="/examinations"><Button variant="secondary">Back to Hub</Button></Link>}
      />
      <Card className="p-4 space-y-4 max-w-xl">
        <SelectField
          label="Exam"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          placeholder="Select exam"
          options={exams.map((ex) => ({ value: ex.id, label: ex.name }))}
        />
        <Input label="Student ID (UUID)" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <Input label="Subject ID (UUID)" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} />
        <Input label="Marks Obtained" type="number" value={marks} onChange={(e) => setMarks(e.target.value)} />
        <Button
          variant="primary"
          disabled={!examId || !studentId || !subjectId || !marks || enterMut.isPending}
          onClick={() => enterMut.mutate()}
        >
          Save Marks
        </Button>
      </Card>
    </div>
  )
}

export function AssessmentsResultsPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const [examId, setExamId] = useState('')

  const examsQuery = useQuery({
    queryKey: ['assessments-exams-results', schoolId],
    queryFn: () => assessmentsService.exams(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId),
  })
  const exams = useMemo(() => normalizeList(examsQuery.data), [examsQuery.data])

  const processMut = useMutation({
    mutationFn: () => assessmentsService.processResults(examId, schoolId ? { school_id: schoolId } : {}),
    onSuccess: (res) => {
      const d = unwrap(res)
      toast.success(`Processed ${d.processed_students ?? 0} students`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const publishMut = useMutation({
    mutationFn: () => assessmentsService.publishResults(examId, schoolId ? { school_id: schoolId } : {}),
    onSuccess: (res) => {
      const d = unwrap(res)
      toast.success(`Published ${d.snapshots ?? 0} snapshots for report cards`)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const snapshotsQuery = useQuery({
    queryKey: ['published-snapshots', examId, schoolId],
    queryFn: () => assessmentsService.publishedSnapshots({ school: schoolId, exam: examId }),
    enabled: Boolean(schoolId && examId),
  })
  const snapshots = useMemo(() => normalizeList(snapshotsQuery.data), [snapshotsQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results & Publishing"
        description="Process aggregated results and publish immutable snapshots — the only contract for future report card layouts."
        actions={<Link to="/examinations"><Button variant="secondary">Back to Hub</Button></Link>}
      />
      <Card className="p-4 space-y-4 max-w-xl">
        <SelectField
          label="Exam"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
          placeholder="Select exam"
          options={exams.map((ex) => ({
            value: ex.id,
            label: `${ex.name} (${ex.status})`,
          }))}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" disabled={!examId || processMut.isPending} onClick={() => processMut.mutate()}>
            Process Results
          </Button>
          <Button variant="success" disabled={!examId || publishMut.isPending} onClick={() => publishMut.mutate()}>
            Publish Snapshots
          </Button>
        </div>
      </Card>
      {examId && (
        <Card className="p-4">
          <h3 className="mb-2 font-semibold">Published Snapshots ({snapshots.length})</h3>
          <p className="text-sm text-slate-500 mb-3">Report Card module reads these payloads — no recalculation from raw marks.</p>
          {snapshots.length === 0 ? (
            <p className="text-sm text-slate-400">No snapshots yet.</p>
          ) : (
            <ul className="text-sm space-y-1">
              {snapshots.map((s) => (
                <li key={s.id}>{s.admission_number} — v{s.snapshot_version} — {s.payload?.overall?.grade || '—'}</li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}
