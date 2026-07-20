import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiUsers,
  FiHome,
  FiUserPlus,
  FiLink,
  FiSettings,
  FiShield,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { parentService } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const QUICK_LINKS = [
  { to: '/parents/roster', label: 'Guardian Roster', icon: FiUsers, desc: 'Search & manage guardians' },
  { to: '/parents/new', label: 'Add Guardian', icon: FiUserPlus, desc: 'Create parent login + profile' },
  { to: '/parents/households', label: 'Households', icon: FiHome, desc: 'Family / joint household units' },
  { to: '/students', label: 'SIS Students', icon: FiLink, desc: 'Link to student identities' },
]

export default function ParentsHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const dashQuery = useQuery({
    queryKey: ['guardian-dashboard', schoolId],
    queryFn: () => parentService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })
  const settingsQuery = useQuery({
    queryKey: ['guardian-settings', schoolId],
    queryFn: () => parentService.getGuardianSettings(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId),
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])
  const settings = useMemo(() => unwrap(settingsQuery.data), [settingsQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family & Guardian Management"
        description="Central family system — guardians reference SIS students only"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/parents/roster">
              <Button variant="primary"><FiUsers className="h-4 w-4" /> Roster</Button>
            </Link>
            <Link to="/parents/new">
              <Button variant="secondary"><FiUserPlus className="h-4 w-4" /> New Guardian</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Guardians" value={String(dash.total_guardians ?? '—')} icon={FiUsers} />
        <StatCard title="Active" value={String(dash.active ?? '—')} icon={FiShield} color="success" />
        <StatCard title="Student Links" value={String(dash.total_links ?? '—')} icon={FiLink} />
        <StatCard title="Households" value={String(dash.households ?? '—')} icon={FiHome} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Fee Responsible" value={String(dash.fee_responsible_links ?? '—')} icon={FiSettings} />
        <StatCard title="Pickup Authorized" value={String(dash.pickup_authorized_links ?? '—')} icon={FiShield} />
        <StatCard title="Portal Enabled" value={String(dash.portal_enabled ?? '—')} icon={FiUsers} />
        <StatCard
          title="Cross-School Links"
          value={settings.allow_cross_school_links === false ? 'Off' : 'On'}
          icon={FiLink}
        />
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
              <div className="font-medium">{item.label}</div>
              <div className="text-xs text-muted">{item.desc}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
