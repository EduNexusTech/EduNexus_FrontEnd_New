import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiCalendar,
  FiClock,
  FiAlertTriangle,
  FiUsers,
  FiLayers,
  FiRefreshCw,
  FiSettings,
  FiPlus,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { timetableService, academicYearService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const WEEKDAYS = [
  { label: 'Mon', value: '0' },
  { label: 'Tue', value: '1' },
  { label: 'Wed', value: '2' },
  { label: 'Thu', value: '3' },
  { label: 'Fri', value: '4' },
  { label: 'Sat', value: '5' },
]

const QUICK_LINKS = [
  { to: '/timetable/builder', label: 'Schedule Builder', icon: FiLayers, desc: 'Assign periods & slots' },
  { to: '/timetable/substitutions', label: 'Substitutions', icon: FiRefreshCw, desc: 'Absence coverage' },
  { to: '/teachers', label: 'Teachers', icon: FiUsers, desc: 'Academic staff SoT' },
  { to: '/attendance', label: 'Attendance', icon: FiCalendar, desc: 'Peer engine — calendar' },
]

export default function TimetableHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const qc = useQueryClient()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [yearId, setYearId] = useState('')

  const dashQuery = useQuery({
    queryKey: ['timetable-dashboard', schoolId],
    queryFn: () => timetableService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const setsQuery = useQuery({
    queryKey: ['timetable-sets', schoolId],
    queryFn: () => timetableService.list(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const yearsQuery = useQuery({
    queryKey: ['academic-years-tt', schoolId],
    queryFn: () => academicYearService.list(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId),
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])
  const sets = useMemo(() => {
    const d = unwrap(setsQuery.data)
    return d.results || d || []
  }, [setsQuery.data])
  const years = useMemo(() => {
    const d = unwrap(yearsQuery.data)
    const list = d.results || d || []
    return Array.isArray(list) ? list : []
  }, [yearsQuery.data])

  const createMut = useMutation({
    mutationFn: () => timetableService.create({
      name,
      code,
      academic_year_id: yearId,
      ...(schoolId ? { school_id: schoolId } : {}),
    }),
    onSuccess: () => {
      toast.success('Timetable created (draft v1)')
      setName('')
      setCode('')
      qc.invalidateQueries({ queryKey: ['timetable-dashboard'] })
      qc.invalidateQueries({ queryKey: ['timetable-sets'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timetable & Scheduling"
        description="Enterprise scheduling engine for academic, events, meetings & resources — not examination or homework"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/timetable/builder">
              <Button variant="primary"><FiLayers className="h-4 w-4" /> Builder</Button>
            </Link>
            <Link to="/timetable/substitutions">
              <Button variant="secondary"><FiRefreshCw className="h-4 w-4" /> Substitutions</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Timetable Sets" value={String(dash.timetable_sets ?? '—')} icon={FiCalendar} />
        <StatCard title="Published" value={String(dash.published_versions ?? '—')} icon={FiClock} color="success" />
        <StatCard title="Drafts" value={String(dash.draft_versions ?? '—')} icon={FiLayers} />
        <StatCard title="Open Conflicts" value={String(dash.open_conflicts ?? '—')} icon={FiAlertTriangle} color="warning" />
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FiPlus className="h-5 w-5" /> New timetable set
          </h3>
          <SelectField
            label="Academic year"
            value={yearId}
            onChange={(e) => setYearId(e.target.value)}
            options={[
              { label: 'Select year…', value: '' },
              ...years.map((y) => ({
                label: y.name || y.year_name || String(y.id),
                value: String(y.id),
              })),
            ]}
          />
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Grade 8 — Term 1" />
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="G8-T1" />
          <Button
            variant="primary"
            disabled={!name || !code || !yearId || createMut.isPending}
            onClick={() => createMut.mutate()}
          >
            Create draft
          </Button>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FiSettings className="h-5 w-5" /> Timetable sets
          </h3>
          {setsQuery.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
          {!setsQuery.isLoading && (!sets || sets.length === 0) && (
            <p className="text-sm text-slate-500">No timetable sets yet.</p>
          )}
          <ul className="divide-y divide-slate-100">
            {(Array.isArray(sets) ? sets : []).slice(0, 12).map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium text-slate-800">{s.name}</div>
                  <div className="text-slate-500">{s.code} · {s.domain}</div>
                </div>
                <Link
                  to={`/timetable/builder?version=${s.published_version_id || ''}&set=${s.id}`}
                  className="text-primary-600 hover:underline"
                >
                  Open
                </Link>
              </li>
            ))}
          </ul>
          <div className="text-sm text-slate-500">
            Active slots: {dash.active_slots ?? '—'}
          </div>
        </Card>
      </div>
    </div>
  )
}

export function TimetableBuilderPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const params = new URLSearchParams(window.location.search)
  const [versionId, setVersionId] = useState(params.get('version') || '')
  const [weekday, setWeekday] = useState('0')
  const [period, setPeriod] = useState('1')
  const [title, setTitle] = useState('')
  const qc = useQueryClient()

  const slotsQuery = useQuery({
    queryKey: ['timetable-slots', versionId, weekday],
    queryFn: () => timetableService.slots(versionId, {
      ...(schoolId ? { school: schoolId } : {}),
      weekday,
    }),
    enabled: Boolean(versionId),
  })

  const conflictsQuery = useQuery({
    queryKey: ['timetable-conflicts', versionId],
    queryFn: () => timetableService.conflicts(versionId, schoolId ? { school: schoolId } : {}),
    enabled: Boolean(versionId),
  })

  const slots = useMemo(() => {
    const d = unwrap(slotsQuery.data)
    return d.results || []
  }, [slotsQuery.data])

  const conflicts = useMemo(() => {
    const d = unwrap(conflictsQuery.data)
    return d.results || []
  }, [conflictsQuery.data])

  const addSlot = useMutation({
    mutationFn: () => timetableService.createSlot(versionId, {
      weekday: Number(weekday),
      period_number: Number(period),
      title,
      ...(schoolId ? { school_id: schoolId } : {}),
    }),
    onSuccess: () => {
      toast.success('Slot saved')
      setTitle('')
      qc.invalidateQueries({ queryKey: ['timetable-slots'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const detectConflicts = useMutation({
    mutationFn: () => timetableService.detectConflicts(versionId, schoolId ? { school_id: schoolId } : {}),
    onSuccess: (res) => {
      const n = unwrap(res).results?.length ?? 0
      toast.success(`${n} conflict(s) found`)
      qc.invalidateQueries({ queryKey: ['timetable-conflicts'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const publish = useMutation({
    mutationFn: () => timetableService.publish(versionId, schoolId ? { school_id: schoolId } : {}),
    onSuccess: () => toast.success('Timetable published'),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule Builder"
        description="Assign weekday periods for a draft timetable version"
        actions={
          <Link to="/timetable"><Button variant="secondary">Back to hub</Button></Link>
        }
      />
      <Card className="p-5 space-y-4">
        <Input
          label="Version ID"
          value={versionId}
          onChange={(e) => setVersionId(e.target.value)}
          placeholder="Paste draft version UUID"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <SelectField
            label="Weekday"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value)}
            options={WEEKDAYS}
          />
          <Input label="Period #" type="number" value={period} onChange={(e) => setPeriod(e.target.value)} />
          <Input label="Title / label" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" disabled={!versionId || addSlot.isPending} onClick={() => addSlot.mutate()}>
            Add slot
          </Button>
          <Button variant="secondary" disabled={!versionId} onClick={() => detectConflicts.mutate()}>
            Detect conflicts
          </Button>
          <Button variant="primary" disabled={!versionId || publish.isPending} onClick={() => publish.mutate()}>
            Publish
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 font-semibold text-slate-900">Slots ({slots.length})</h3>
          <ul className="max-h-80 space-y-2 overflow-auto text-sm">
            {slots.map((s) => (
              <li key={s.id} className="rounded border border-slate-100 px-3 py-2">
                P{s.period_number} · {s.teacher_name || '—'} · {s.subject_name || s.title || '—'}
              </li>
            ))}
            {!slots.length && <li className="text-slate-500">No slots for this filter.</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="mb-3 font-semibold text-slate-900">Conflicts ({conflicts.length})</h3>
          <ul className="max-h-80 space-y-2 overflow-auto text-sm">
            {conflicts.map((c) => (
              <li key={c.id} className="rounded border border-amber-100 bg-amber-50 px-3 py-2">
                <span className="font-medium">{c.conflict_type}</span> ({c.severity}): {c.message}
              </li>
            ))}
            {!conflicts.length && <li className="text-slate-500">No unresolved conflicts.</li>}
          </ul>
        </Card>
      </div>
    </div>
  )
}

export function TimetableSubstitutionsPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const listQuery = useQuery({
    queryKey: ['timetable-substitutions', schoolId],
    queryFn: () => timetableService.substitutions(schoolId ? { school: schoolId } : {}),
  })

  const rows = useMemo(() => {
    const d = unwrap(listQuery.data)
    return d.results || []
  }, [listQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Substitutions"
        description="Teacher absence coverage with suggestion engine & approval"
        actions={<Link to="/timetable"><Button variant="secondary">Back</Button></Link>}
      />
      <Card className="overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Absent</th>
              <th className="px-4 py-3">Substitute</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-2">{r.substitution_date}</td>
                <td className="px-4 py-2">{r.absent_teacher_name || '—'}</td>
                <td className="px-4 py-2">{r.substitute_teacher_name || '—'}</td>
                <td className="px-4 py-2">{r.status}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No substitutions yet. Create from API or builder workflow.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
