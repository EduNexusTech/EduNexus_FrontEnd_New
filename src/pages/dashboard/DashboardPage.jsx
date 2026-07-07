import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiBriefcase,
  FiBook,
  FiUsers,
  FiActivity,
  FiPlus,
} from 'react-icons/fi'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { dashboardService } from '@/api/services'
import { unwrapData, getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader, StatCard, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import Button from '@/components/ui/Button'
import { formatNumber, formatDateTime } from '@/utils/format'

function mapChartData(charts) {
  const registrations = charts?.monthly_registrations || []
  if (registrations.length) {
    return registrations.map((row) => ({
      month: row.month,
      users: row.users ?? 0,
      schools: row.schools ?? 0,
      organizations: row.organizations ?? 0,
    }))
  }

  const userGrowth = charts?.user_growth || []
  const schoolGrowth = charts?.schools_growth || []
  if (userGrowth.length) {
    return userGrowth.map((row, i) => ({
      month: row.month,
      users: row.count ?? 0,
      schools: schoolGrowth[i]?.count ?? 0,
    }))
  }

  return []
}

export default function DashboardPage() {
  const { isSuperAdmin } = useAuth()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.superAdmin({ limit: 10, months: 6 }),
    enabled: isSuperAdmin,
    refetchInterval: 60000,
  })

  if (!isSuperAdmin) {
    return (
      <div className="w-full">
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
        <PageHeader title="Dashboard" subtitle="Welcome to EduNexus" />
        <Card>
          <p className="text-muted">
            Your account does not have super-admin access. Use the sidebar to open modules available to your role.
          </p>
        </Card>
      </div>
    )
  }

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />

  const dashboard = unwrapData(data) || {}
  const statistics = dashboard.statistics || {}
  const charts = dashboard.charts || {}

  const kpis = [
    { title: 'Organizations', value: formatNumber(statistics.total_organizations ?? 0), icon: FiBriefcase, color: 'primary' },
    { title: 'Schools', value: formatNumber(statistics.total_schools ?? 0), icon: FiBook, color: 'accent' },
    { title: 'Users', value: formatNumber(statistics.total_users ?? 0), icon: FiUsers, color: 'success' },
    { title: 'Active Users', value: formatNumber(statistics.active_users ?? 0), icon: FiActivity, color: 'warning' },
  ]

  const chartData = mapChartData(charts)
  const recentActivity = dashboard.live_activities || dashboard.recent_activity || []
  const recentOrgs = dashboard.recent_organizations || []

  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      <PageHeader
        title="Dashboard"
        subtitle="Platform overview and key metrics"
        actions={
          <>
            <Button variant="secondary" onClick={() => refetch()}>Refresh</Button>
            <Link to="/organizations/new"><Button><FiPlus /> New Organization</Button></Link>
          </>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...kpi} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Growth Overview</h3>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted py-12 text-center">No chart data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="users" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="schools" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">User Trend</h3>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted py-12 text-center">No chart data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Organizations</h3>
          {recentOrgs.length === 0 ? (
            <p className="text-muted text-sm">No recent organizations</p>
          ) : (
            <div className="space-y-3">
              {recentOrgs.slice(0, 5).map((org) => (
                <div key={org.organization_id || org.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                  <div>
                    <p className="font-medium text-sm">{org.organization_name || org.name}</p>
                    <p className="text-xs text-muted">{org.organization_code || org.code}</p>
                  </div>
                  <StatusBadge active={org.is_active} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p className="text-muted text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex gap-3 rounded-xl border border-border p-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{item.title || item.action || item.description}</p>
                    <p className="text-xs text-muted">{item.description || item.title}</p>
                    <p className="text-xs text-muted mt-1">{formatDateTime(item.timestamp || item.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function StatusBadge({ active }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${active !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-muted'}`}>
      {active !== false ? 'Active' : 'Inactive'}
    </span>
  )
}
