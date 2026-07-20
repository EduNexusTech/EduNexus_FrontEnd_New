import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiUsers,
  FiUserPlus,
  FiSearch,
  FiUpload,
  FiSettings,
  FiRefreshCw,
  FiAward,
  FiGitBranch,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { studentService } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const QUICK_LINKS = [
  { to: '/students/roster', label: 'Student Roster', icon: FiUsers, desc: 'Search & manage profiles' },
  { to: '/students/new', label: 'Manual Create', icon: FiUserPlus, desc: 'Requires SIS setting' },
  { to: '/admissions/conversion', label: 'Admission Conversion', icon: FiGitBranch, desc: 'Primary origin path' },
  { to: '/students/roster', label: 'Advanced Search', icon: FiSearch, desc: 'RFID / admission / roll' },
]

export default function StudentsHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const dashQuery = useQuery({
    queryKey: ['sis-dashboard', schoolId],
    queryFn: () => studentService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })
  const settingsQuery = useQuery({
    queryKey: ['sis-settings', schoolId],
    queryFn: () => studentService.getSisSettings(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId),
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])
  const settings = useMemo(() => unwrap(settingsQuery.data), [settingsQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Information System"
        description="Single source of truth for student identity and lifecycle"
        actions={
          <div className="flex flex-wrap gap-2">
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
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Students" value={String(dash.total_students ?? '—')} icon={FiUsers} />
        <StatCard title="Active" value={String(dash.active ?? '—')} icon={FiAward} color="success" />
        <StatCard title="Transferred" value={String(dash.transferred ?? '—')} icon={FiGitBranch} />
        <StatCard title="Alumni" value={String(dash.alumni ?? '—')} icon={FiAward} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Inactive" value={String(dash.inactive ?? '—')} icon={FiUsers} />
        <StatCard title="Archived" value={String(dash.archived ?? '—')} icon={FiUpload} />
        <StatCard
          title="From Admission"
          value={String(dash.originated_from_admission ?? '—')}
          icon={FiRefreshCw}
        />
        <StatCard
          title="Manual Create"
          value={settings.allow_manual_student_create ? 'Enabled' : 'Disabled'}
          icon={FiSettings}
        />
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Quick links</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      {Array.isArray(dash.strength_by_standard) && dash.strength_by_standard.length > 0 && (
        <Card className="p-5">
          <h3 className="mb-3 text-sm font-semibold">Strength by standard</h3>
          <ul className="space-y-2 text-sm">
            {dash.strength_by_standard.map((row) => (
              <li key={row.standard} className="flex justify-between border-b border-border/60 py-1">
                <span>{row.standard}</span>
                <span className="font-medium">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
