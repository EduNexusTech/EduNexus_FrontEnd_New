import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { Avatar, StatusBadge } from '@/components/ui/Feedback'
import { formatDateTime } from '@/utils/format'

export default function ProfilePage() {
  const { user } = useAuth()

  const fields = [
    { label: 'Email', value: user?.email },
    { label: 'Mobile', value: user?.mobile_number },
    { label: 'Organization', value: user?.organization_name },
    { label: 'School', value: user?.school_name },
    { label: 'Last Login', value: formatDateTime(user?.last_login) },
    { label: 'Role', value: user?.is_super_admin ? 'Super Admin' : user?.is_org_admin ? 'Org Admin' : user?.is_school_admin ? 'School Admin' : 'User' },
  ]

  const displayName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()

  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'Profile' }]} />
      <PageHeader title="My Profile" subtitle="View and manage your account information" />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="rounded-2xl glass border border-[var(--clay-glass-border)] card-shadow p-6 text-center lg:col-span-4 xl:col-span-3">
          <Avatar name={displayName} src={user?.profile_image} size="lg" />
          <h2 className="mt-4 text-xl font-bold">{displayName}</h2>
          <p className="text-muted text-sm">{user?.email}</p>
          <div className="mt-3">
            <StatusBadge active={user?.is_active} />
          </div>
        </div>

        <div className="lg:col-span-8 xl:col-span-9 rounded-2xl glass border border-[var(--clay-glass-border)] card-shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Account Details</h3>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-medium uppercase tracking-wider text-muted">{f.label}</dt>
                <dd className="mt-1 text-sm font-medium text-text">{f.value || '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
