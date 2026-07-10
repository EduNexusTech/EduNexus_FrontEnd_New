import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  FiUsers,
  FiBookOpen,
  FiHeart,
  FiBriefcase,
  FiUserPlus,
  FiCalendar,
  FiDollarSign,
  FiClipboard,
  FiTruck,
  FiBook,
  FiClock,
  FiActivity,
  FiBell,
  FiGift,
  FiRefreshCw,
} from 'react-icons/fi'
import { dashboardService } from '@/api/services'
import { unwrapData, getErrorMessage } from '@/api/client'
import { PageHeader, StatCard, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import Button from '@/components/ui/Button'
import { formatNumber, formatDateTime } from '@/utils/format'

function PendingHint({ ready, label = 'Module pending' }) {
  if (ready) return null
  return <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-muted">{label}</span>
}

function EmptyList({ message }) {
  return <p className="py-6 text-center text-sm text-muted">{message}</p>
}

export default function SchoolDashboardView() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', 'school-admin'],
    queryFn: () => dashboardService.schoolAdmin({ limit: 10 }),
    refetchInterval: 60000,
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />

  const dashboard = unwrapData(data) || {}
  const school = dashboard.school || {}
  const statistics = dashboard.statistics || {}
  const modulesReady = dashboard.modules_ready || {}
  const quickActions = dashboard.quick_actions || []
  const recentActivities = dashboard.recent_activities || []
  const recentAdmissions = dashboard.recent_admissions || []
  const announcements = dashboard.announcements || []
  const calendarEvents = dashboard.calendar_events || []
  const birthdayStudents = dashboard.birthday_students || []
  const birthdayStaff = dashboard.birthday_staff || []

  const peopleKpis = [
    { title: 'Students', value: formatNumber(statistics.total_students ?? 0), icon: FiUsers, color: 'primary' },
    { title: 'Teachers', value: formatNumber(statistics.total_teachers ?? 0), icon: FiBookOpen, color: 'accent' },
    { title: 'Parents', value: formatNumber(statistics.total_parents ?? 0), icon: FiHeart, color: 'success' },
    { title: 'Staff', value: formatNumber(statistics.total_staff ?? 0), icon: FiBriefcase, color: 'warning' },
  ]

  const opsKpis = [
    {
      title: 'Admissions Today',
      value: formatNumber(statistics.admissions_today ?? 0),
      icon: FiUserPlus,
      color: 'primary',
      ready: modulesReady.admissions,
    },
    {
      title: 'Admissions This Month',
      value: formatNumber(statistics.admissions_this_month ?? 0),
      icon: FiCalendar,
      color: 'accent',
      ready: modulesReady.admissions,
    },
    {
      title: "Today's Attendance",
      value:
        statistics.attendance_today_rate == null
          ? '—'
          : `${Number(statistics.attendance_today_rate).toFixed(1)}%`,
      icon: FiClipboard,
      color: 'success',
      ready: modulesReady.attendance,
    },
    {
      title: 'Fee Collection Today',
      value: formatNumber(statistics.fee_collection_today ?? 0),
      icon: FiDollarSign,
      color: 'warning',
      ready: modulesReady.fees,
    },
    {
      title: 'Fee Due Amount',
      value: formatNumber(statistics.fee_due_amount ?? 0),
      icon: FiDollarSign,
      color: 'primary',
      ready: modulesReady.fees,
    },
    {
      title: 'Assignments Pending',
      value: formatNumber(statistics.assignments_pending ?? 0),
      icon: FiClock,
      color: 'accent',
      ready: modulesReady.assignments,
    },
    {
      title: 'Upcoming Exams',
      value: formatNumber(statistics.upcoming_exams ?? 0),
      icon: FiBook,
      color: 'success',
      ready: modulesReady.exams,
    },
    {
      title: 'Transport Vehicles',
      value: formatNumber(statistics.transport_vehicles ?? 0),
      icon: FiTruck,
      color: 'warning',
      ready: modulesReady.transport,
    },
    {
      title: 'Library Books',
      value: formatNumber(statistics.library_books ?? 0),
      icon: FiBookOpen,
      color: 'primary',
      ready: modulesReady.library,
    },
  ]

  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      <PageHeader
        title="School Dashboard"
        subtitle={
          school.school_name
            ? `${school.school_name}${school.organization_name ? ` · ${school.organization_name}` : ''}`
            : 'School overview and key metrics'
        }
        actions={
          <Button variant="secondary" onClick={() => refetch()} loading={isFetching}>
            <FiRefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">People</h2>
          <PendingHint ready={modulesReady.people_counts !== false} label="Live" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {peopleKpis.map((kpi, i) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StatCard {...kpi} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Operations</h2>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {opsKpis.map((kpi, i) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.03 }}
            >
              <div className="relative">
                <StatCard title={kpi.title} value={kpi.value} icon={kpi.icon} color={kpi.color} />
                {!kpi.ready ? (
                  <p className="absolute bottom-3 left-4 right-4 text-[10px] text-muted">Coming soon</p>
                ) : null}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <Card>
          <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Link key={action.key} to={action.path}>
                <Button variant="outline" size="sm">
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <FiActivity className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Recent Activities</h3>
          </div>
          {recentActivities.length === 0 ? (
            <EmptyList message="No recent activity for this school" />
          ) : (
            <div className="space-y-3">
              {recentActivities.slice(0, 8).map((item) => (
                <div key={item.id} className="flex gap-3 rounded-xl border border-border p-3">
                  <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted">{item.description}</p>
                    <p className="mt-1 text-xs text-muted">{formatDateTime(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <FiUserPlus className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Recent Admissions</h3>
            <PendingHint ready={modulesReady.admissions} />
          </div>
          {recentAdmissions.length === 0 ? (
            <EmptyList
              message={
                modulesReady.admissions
                  ? 'No recent admissions'
                  : 'Admissions module is not enabled yet'
              }
            />
          ) : (
            <div className="space-y-3">
              {recentAdmissions.slice(0, 8).map((item) => (
                <div key={item.id || item.admission_id} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-medium">{item.title || item.student_name}</p>
                  <p className="text-xs text-muted">{formatDateTime(item.timestamp || item.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <FiGift className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Birthday Students</h3>
            <PendingHint ready={modulesReady.birthdays} />
          </div>
          {birthdayStudents.length === 0 ? (
            <EmptyList message={modulesReady.birthdays ? 'No birthdays today' : 'Birthdays unlock with student profiles'} />
          ) : (
            <ul className="space-y-2">
              {birthdayStudents.map((item) => (
                <li key={item.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  {item.name || item.full_name}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <FiGift className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Birthday Staff</h3>
            <PendingHint ready={modulesReady.birthdays} />
          </div>
          {birthdayStaff.length === 0 ? (
            <EmptyList message={modulesReady.birthdays ? 'No birthdays today' : 'Birthdays unlock with staff profiles'} />
          ) : (
            <ul className="space-y-2">
              {birthdayStaff.map((item) => (
                <li key={item.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                  {item.name || item.full_name}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2">
            <FiBell className="h-4 w-4 text-primary" />
            <h3 className="text-lg font-semibold">Announcements</h3>
            <PendingHint ready={modulesReady.announcements} />
          </div>
          {announcements.length === 0 ? (
            <EmptyList
              message={
                modulesReady.announcements
                  ? 'No announcements'
                  : 'Announcements module is not enabled yet'
              }
            />
          ) : (
            <div className="space-y-3">
              {announcements.map((item) => (
                <div key={item.id} className="rounded-xl border border-border p-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted">{item.message || item.body}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <FiCalendar className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-semibold">Calendar Events</h3>
          <PendingHint ready={modulesReady.calendar !== false} label="Academic years" />
        </div>
        {calendarEvents.length === 0 ? (
          <EmptyList message="No upcoming academic calendar events" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {calendarEvents.map((event) => (
              <div key={event.id} className="rounded-xl border border-border p-4">
                <p className="text-sm font-semibold">{event.title}</p>
                <p className="mt-1 text-xs text-muted">
                  {event.start_date}
                  {event.end_date ? ` → ${event.end_date}` : ''}
                </p>
                {event.is_current ? (
                  <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                    Current
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
