import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiUsers,
  FiUserPlus,
  FiUpload,
  FiSettings,
  FiRefreshCw,
  FiAward,
  FiGitBranch,
  FiFileText,
  FiShuffle,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { StudentSearchBar, StudentSearchCandidates } from '@/components/fees/StudentSearchBar'
import StudentSearchResultCard from '@/components/students/StudentSearchResultCard'
import { studentService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { useStudentLookup } from '@/hooks/useStudentLookup'
import { cn } from '@/lib/utils'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const QUICK_LINKS = [
  { to: '/students/roster', label: 'Student Roster', icon: FiUsers, desc: 'Search & manage profiles' },
  { to: '/students/shuffle', label: 'Class / Section Shuffle', icon: FiShuffle, desc: 'Move students between sections or standards' },
  { to: '/students/reports/class-wise', label: 'Class-wise Report', icon: FiFileText, desc: 'Students by class & section' },
  { to: '/students/new', label: 'Manual Create', icon: FiUserPlus, desc: 'Direct profile creation' },
  { to: '/admissions/conversion', label: 'Admission Conversion', icon: FiGitBranch, desc: 'Primary origin path' },
]

function ToggleSwitch({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-primary bg-primary' : 'border-border bg-muted/60',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
          checked ? 'translate-x-[1.35rem]' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

function SisSettingsMenu({
  open,
  onClose,
  settings,
  canManage,
  pending,
  loading,
  onToggleManual,
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose()
      }
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  const enabled = Boolean(settings.allow_manual_student_create)

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-30 mt-2 w-72 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-elevated)]"
    >
      <div className="mb-2 flex items-center gap-2">
        <FiSettings className="h-4 w-4 text-muted" />
        <h3 className="text-sm font-semibold text-foreground">SIS settings</h3>
      </div>
      <p className="mb-3 text-xs text-muted">
        Allow staff to add students directly, or require admission conversion only.
      </p>

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Manual create</p>
          <p className="text-xs text-muted">{enabled ? 'Active' : 'Inactive'}</p>
        </div>
        {canManage ? (
          <ToggleSwitch
            checked={enabled}
            disabled={pending || loading}
            label="Toggle manual student creation"
            onChange={onToggleManual}
          />
        ) : (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
              enabled ? 'bg-green-50 text-green-700' : 'bg-muted text-muted',
            )}
          >
            {enabled ? 'On' : 'Off'}
          </span>
        )}
      </div>

      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        {enabled
          ? 'Staff can use Students → New Student to create profiles directly.'
          : 'New students must come from Admissions → Convert to Student.'}
      </p>

      {!canManage ? (
        <p className="mt-2 text-[11px] text-muted">Contact your school admin to change this setting.</p>
      ) : null}
    </div>
  )
}

function StrengthList({ rows, emptyLabel }) {
  if (!rows?.length) {
    return <p className="py-6 text-center text-sm text-muted">{emptyLabel}</p>
  }

  return (
    <ul className="divide-y divide-border/60 text-sm">
      {rows.map((row) => (
        <li
          key={row.key}
          className="flex items-center justify-between gap-3 py-1.5"
        >
          <span className="min-w-0 truncate text-foreground">{row.label}</span>
          <span className="shrink-0 font-semibold tabular-nums text-foreground">{row.count}</span>
        </li>
      ))}
    </ul>
  )
}

export default function StudentsHubPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const schoolScope = useSchoolScopedSelection()
  const schoolId = schoolScope.schoolId || user?.school_id || user?.school || undefined
  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope],
  )
  const canManageSisSettings = Boolean(
    user?.is_super_admin || user?.is_org_admin || user?.is_school_admin,
  )
  const sisParams = schoolId ? { school: schoolId } : {}
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [reportTab, setReportTab] = useState('section')

  const studentLookup = useStudentLookup({
    schoolId: schoolScope.schoolId,
    listConfig,
    queryKeyPrefix: 'sis-hub-student',
    requireYear: false,
  })
  const {
    admissionNo,
    setAdmissionNo,
    studentName,
    setStudentName,
    lookupKey,
    searchCandidates,
    searching,
    handleSearch,
    selectCandidate,
    clearLookup,
    student,
    studentQuery,
  } = studentLookup

  const dashQuery = useQuery({
    queryKey: ['sis-dashboard', schoolId],
    queryFn: () => studentService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })
  const settingsQuery = useQuery({
    queryKey: ['sis-settings', schoolId],
    queryFn: () => studentService.getSisSettings(sisParams),
    enabled: Boolean(schoolId),
  })

  const settingsMutation = useMutation({
    mutationFn: (payload) => studentService.updateSisSettings(payload, sisParams),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sis-settings', schoolId] })
      toast.success('SIS settings updated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])
  const settings = useMemo(() => unwrap(settingsQuery.data), [settingsQuery.data])

  const statsPrimary = [
    { title: 'Total Students', value: dash.total_students ?? '—', icon: FiUsers },
    { title: 'Active', value: dash.active ?? '—', icon: FiAward, color: 'success' },
    { title: 'In Classes', value: dash.enrolled_in_classes ?? '—', icon: FiFileText },
    { title: 'Transferred', value: dash.transferred ?? '—', icon: FiGitBranch },
  ]

  const statsSecondary = [
    { title: 'Alumni', value: dash.alumni ?? '—', icon: FiAward },
    { title: 'Inactive', value: dash.inactive ?? '—', icon: FiUsers },
    { title: 'Archived', value: dash.archived ?? '—', icon: FiUpload },
    { title: 'From Admission', value: dash.originated_from_admission ?? '—', icon: FiRefreshCw },
  ]

  const sectionRows = useMemo(
    () =>
      (dash.strength_by_section || []).map((row) => ({
        key: `${row.standard}-${row.section}`,
        label: `${row.standard || '—'}${row.section ? ` — ${row.section}` : ''}`,
        count: row.count,
      })),
    [dash.strength_by_section],
  )

  const standardRows = useMemo(
    () =>
      (dash.strength_by_standard || []).map((row) => ({
        key: row.standard,
        label: row.standard || '—',
        count: row.count,
      })),
    [dash.strength_by_standard],
  )

  const hasReports = sectionRows.length > 0 || standardRows.length > 0

  useEffect(() => {
    if (sectionRows.length > 0) {
      setReportTab('section')
    } else if (standardRows.length > 0) {
      setReportTab('standard')
    }
  }, [sectionRows.length, standardRows.length])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Information System"
        description="Single source of truth for student identity and lifecycle"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/students/roster">
              <Button variant="primary">
                <FiUsers className="h-4 w-4" />
                Open Roster
              </Button>
            </Link>

            <Link to="/admissions/conversion">
              <Button variant="secondary">
                <FiRefreshCw className="h-4 w-4" />
                Convert Admissions
              </Button>
            </Link>

            {Boolean(schoolId) ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2.5 hover:bg-transparent"
                  aria-label="SIS settings"
                  aria-expanded={settingsOpen}
                  onClick={() => setSettingsOpen((open) => !open)}
                >
                  <FiSettings className="h-4 w-4" />
                </Button>
                <SisSettingsMenu
                  open={settingsOpen}
                  onClose={() => setSettingsOpen(false)}
                  settings={settings}
                  canManage={canManageSisSettings}
                  pending={settingsMutation.isPending}
                  loading={settingsQuery.isLoading}
                  onToggleManual={(next) => {
                    settingsMutation.mutate({ allow_manual_student_create: next })
                  }}
                />
              </div>
            ) : null}
          </div>
        }
      />

      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Find student</h3>
          <p className="text-xs text-muted">
            Enter admission number or student name, then search to view profile details.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <SchoolScopeField
            className="w-full min-w-[10rem] lg:w-auto lg:min-w-[11rem] lg:flex-1"
            compact
            schoolId={schoolScope.schoolId}
            setSchoolId={(next) => {
              schoolScope.setSchoolId(next)
              clearLookup()
            }}
            schoolOptions={schoolScope.schoolOptions}
            selectedSchoolLabel={schoolScope.selectedSchoolLabel}
            schoolLocked={schoolScope.schoolLocked}
          />
          <StudentSearchBar
            admissionNo={admissionNo}
            studentName={studentName}
            onAdmissionNoChange={setAdmissionNo}
            onStudentNameChange={setStudentName}
            onSearch={handleSearch}
            searching={searching}
            searchDisabled={
              (!admissionNo.trim() && !studentName.trim()) || !schoolScope.schoolId || searching
            }
          />
        </div>

        <StudentSearchCandidates candidates={searchCandidates} onSelect={selectCandidate} />

        {studentQuery.isError && lookupKey ? (
          <p className="mt-3 text-sm text-red-600">{getErrorMessage(studentQuery.error)}</p>
        ) : null}

        {student ? <StudentSearchResultCard student={student} className="mt-4" /> : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsPrimary.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={String(stat.value)}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsSecondary.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={String(stat.value)}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Quick links</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-xl border border-border p-4 transition hover:border-primary/40 hover:bg-muted/40"
              >
                <item.icon className="mb-2 h-5 w-5 text-primary" />
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-muted">{item.desc}</div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="flex min-h-0 flex-col p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">Strength report</h3>
            <Link
              to="/students/reports/class-wise"
              className="text-xs font-medium text-primary hover:underline"
            >
              Full class-wise report
            </Link>
          </div>

          {hasReports ? (
            <>
              <div className="mb-2 flex gap-1 rounded-lg border border-border bg-muted/20 p-0.5">
                {sectionRows.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setReportTab('section')}
                    className={cn(
                      'flex-1 rounded-md px-2 py-1 text-xs font-medium transition',
                      reportTab === 'section'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted hover:text-foreground',
                    )}
                  >
                    By section
                  </button>
                ) : null}
                {standardRows.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setReportTab('standard')}
                    className={cn(
                      'flex-1 rounded-md px-2 py-1 text-xs font-medium transition',
                      reportTab === 'standard'
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted hover:text-foreground',
                    )}
                  >
                    By standard
                  </button>
                ) : null}
              </div>

              <div className="max-h-52 overflow-y-auto pr-1">
                {reportTab === 'section' ? (
                  <StrengthList rows={sectionRows} emptyLabel="No section data yet." />
                ) : (
                  <StrengthList rows={standardRows} emptyLabel="No standard data yet." />
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
              <FiFileText className="mb-2 h-5 w-5 text-muted" />
              <p className="text-sm text-muted">No strength data yet.</p>
              <Link
                to="/students/reports/class-wise"
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Open class-wise report
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
