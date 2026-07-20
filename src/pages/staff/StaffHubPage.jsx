import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiUsers,
  FiUserPlus,
  FiBriefcase,
  FiGitBranch,
  FiActivity,
  FiSettings,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { staffService } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const QUICK_LINKS = [
  { to: '/staff/roster', label: 'Employee Roster', icon: FiUsers, desc: 'All employees incl. academic staff' },
  { to: '/staff/new', label: 'Add Employee', icon: FiUserPlus, desc: 'Create HR employee + login' },
  { to: '/masters', label: 'Dept & Designation', icon: FiBriefcase, desc: 'Org structure masters' },
  { to: '/teachers', label: 'Academic Staff', icon: FiGitBranch, desc: 'Teachers reference Employees' },
]

export default function StaffHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const dashQuery = useQuery({
    queryKey: ['hrms-dashboard', schoolId],
    queryFn: () => staffService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Human Resource Management"
        description="Enterprise employee SoT — onboarding, org chart, assets. Teachers link here; payroll & leave engines deferred."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/staff/roster">
              <Button variant="primary"><FiUsers className="h-4 w-4" /> Roster</Button>
            </Link>
            <Link to="/staff/new">
              <Button variant="secondary"><FiUserPlus className="h-4 w-4" /> New Employee</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Employees" value={String(dash.total_employees ?? '—')} icon={FiUsers} />
        <StatCard title="Active" value={String(dash.active ?? '—')} icon={FiActivity} color="success" />
        <StatCard title="Onboarding" value={String(dash.onboarding ?? '—')} icon={FiBriefcase} />
        <StatCard title="Academic Staff" value={String(dash.academic_staff ?? '—')} icon={FiGitBranch} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Probation" value={String(dash.probation ?? '—')} icon={FiSettings} />
        {(dash.by_department || []).slice(0, 3).map((row) => (
          <StatCard
            key={row.department__name}
            title={row.department__name || 'Department'}
            value={String(row.c)}
            icon={FiUsers}
          />
        ))}
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Quick links</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-xl border border-border p-4 transition hover:border-primary/40 hover:bg-muted/40"
            >
              <item.icon className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted">{item.desc}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
