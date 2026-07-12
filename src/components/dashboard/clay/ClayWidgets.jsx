import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiTrendingUp,
  FiUsers,
  FiBook,
  FiBriefcase,
  FiClipboard,
  FiLayers,
  FiArrowRight,
  FiFileText,
  FiActivity,
  FiBarChart2,
} from 'react-icons/fi'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatNumber } from '@/utils/format'
import { resolveActionIcon } from '@/utils/dashboardIcons'
import {
  CHART_3D_COLORS,
  Chart3DDefs,
  Bar3DShape,
  Dot3DShape,
  ActiveDot3DShape,
  shadeColor,
} from '@/components/dashboard/clay/chart3d'

const CHART_COLORS = CHART_3D_COLORS
const STAT_BG = ['clay-card-glass-teal', 'clay-card-green', 'clay-card-glass-forest', 'clay-card-white']

const chartTooltipStyle = {
  borderRadius: 10,
  border: '1px solid rgba(82, 183, 136, 0.3)',
  background: 'rgba(255, 255, 255, 0.92)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 6px 20px rgba(30, 77, 58, 0.12)',
  fontSize: 12,
  color: '#1a3d32',
}

export function ClayInsightBanner({ userName, message }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = userName?.split(' ')[0] || 'there'
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="clay-app clay-glass-banner clay-banner-3d mb-5 flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--clay-primary-soft)]">
          {greeting}, {firstName}
        </p>
        <p className="mt-0.5 text-sm text-[var(--clay-primary)]">
          {message || 'Here is your analytics overview for today.'}
        </p>
      </div>
      <p className="shrink-0 text-xs text-[var(--clay-primary-soft)]">{today}</p>
    </div>
  )
}

/** @deprecated Use ClayInsightBanner */
export function ClayWelcomeHero({ userName, message }) {
  return <ClayInsightBanner userName={userName} message={message} />
}

export function ClayStatGrid({ stats = [] }) {
  return (
    <div className="clay-app mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        const bg = STAT_BG[i % STAT_BG.length]
        return (
          <motion.div
            key={stat.title}
            className={`clay-card clay-stat-3d ${bg} p-4`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="clay-icon-3d flex h-9 w-9 items-center justify-center text-[var(--clay-primary)]">
                <Icon className="h-4 w-4" />
              </div>
              {stat.trend ? (
                <span className="clay-trend-up">
                  <FiTrendingUp className="mr-0.5 inline h-3 w-3" />
                  {stat.trend}
                </span>
              ) : null}
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--clay-primary-soft)]">
              {stat.title}
            </p>
            <p className="mt-0.5 text-2xl font-semibold text-[var(--clay-primary)]">{stat.value}</p>
            {stat.hint ? <p className="mt-0.5 text-[11px] text-[var(--clay-primary-soft)]">{stat.hint}</p> : null}
          </motion.div>
        )
      })}
    </div>
  )
}

export function ClayQuickGrid({ actions = [] }) {
  return (
    <div className="clay-app mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {actions.slice(0, 12).map((action, i) => {
        const Icon = resolveActionIcon(action)
        return (
          <motion.div
            key={action.key || action.path}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.02 }}
          >
            <Link
              to={action.path}
              className="clay-card clay-card-white flex flex-col items-center gap-2 p-3.5 text-center"
            >
              <div className="clay-icon-3d flex h-10 w-10 items-center justify-center text-[var(--clay-primary)]">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-medium leading-tight text-[var(--clay-primary)]">{action.label}</span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}

export function ClayBarChartPanel({ title, data = [], dataKey = 'value', labelKey = 'label' }) {
  return (
    <div className="clay-app clay-card clay-card-white clay-card-3d chart-panel-3d h-full p-5">
      <h3 className="chart-panel-title mb-3 flex items-center">
        <span className="chart-panel-accent" aria-hidden />
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="py-14 text-center text-sm text-[var(--clay-primary-soft)]">No data yet</p>
      ) : (
        <div className="chart-3d-stage">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data} barCategoryGap="22%" margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <Chart3DDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(82, 183, 136, 0.2)" vertical={false} />
              <XAxis dataKey={labelKey} stroke="#5c8f7a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#5c8f7a" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(82, 183, 136, 0.08)' }} />
              <Bar dataKey={dataKey} shape={(props) => <Bar3DShape {...props} />} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export function ClayLineChartPanel({ title, data = [], dataKey = 'value', labelKey = 'label' }) {
  return (
    <div className="clay-app clay-card clay-card-white clay-card-3d chart-panel-3d h-full p-5">
      <h3 className="chart-panel-title mb-3 flex items-center">
        <span className="chart-panel-accent" aria-hidden />
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="py-14 text-center text-sm text-[var(--clay-primary-soft)]">No data yet</p>
      ) : (
        <div className="chart-3d-stage">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
              <Chart3DDefs />
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(82, 183, 136, 0.2)" vertical={false} />
              <XAxis dataKey={labelKey} stroke="#5c8f7a" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#5c8f7a" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="none"
                fill="url(#line3d-area-grad)"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="url(#line3d-stroke-grad)"
                strokeWidth={3}
                dot={(props) => <Dot3DShape {...props} />}
                activeDot={(props) => <ActiveDot3DShape {...props} />}
                filter="url(#chart3d-line-glow)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export function ClayDonutPanel({ title, data = [] }) {
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0) || 1

  return (
    <div className="clay-app clay-card clay-card-white clay-card-3d chart-panel-3d h-full p-5">
      <h3 className="chart-panel-title mb-3 flex items-center">
        <span className="chart-panel-accent" aria-hidden />
        {title}
      </h3>
      {data.length === 0 ? (
        <p className="py-14 text-center text-sm text-[var(--clay-primary-soft)]">No data yet</p>
      ) : (
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <div className="chart-3d-stage chart-donut-3d relative w-full">
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Chart3DDefs />
                {/* shadow / depth layer */}
                <Pie
                  data={data}
                  dataKey="value"
                  cx="50%"
                  cy="54%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {data.map((_, index) => (
                    <Cell key={`shadow-${index}`} fill={shadeColor(CHART_COLORS[index % CHART_COLORS.length], -0.45)} />
                  ))}
                </Pie>
                {/* main 3D ring */}
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="48%"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={4}
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth={1}
                >
                  {data.map((_, index) => (
                    <Cell key={index} fill={`url(#pie3d-grad-${index % CHART_COLORS.length})`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-donut-hub pointer-events-none absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
              <span className="text-lg font-bold text-[var(--clay-primary)]">{total > 999 ? `${Math.round(total / 1000)}k` : total}</span>
              <small className="text-[10px] font-medium uppercase tracking-wide text-[var(--clay-primary-soft)]">Total</small>
            </div>
          </div>
          <div className="w-full space-y-2 md:w-36">
            {data.map((item, i) => (
              <div key={item.label} className="clay-legend-3d flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[var(--clay-primary-soft)]">
                  <span
                    className="clay-legend-swatch h-3 w-3 rounded-sm"
                    style={{ background: `linear-gradient(135deg, ${shadeColor(CHART_COLORS[i % CHART_COLORS.length], 0.2)} 0%, ${CHART_COLORS[i % CHART_COLORS.length]} 100%)` }}
                  />
                  {item.label}
                </span>
                <span className="font-semibold text-[var(--clay-primary)]">
                  {Math.round((item.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function ClayRecentList({ title, items = [], emptyMessage }) {
  return (
    <div className="clay-app clay-card clay-card-white clay-card-3d h-full p-5">
      <h3 className="chart-panel-title mb-3 flex items-center">
        <span className="chart-panel-accent" aria-hidden />
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--clay-primary-soft)]">{emptyMessage || 'Nothing here yet'}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 8).map((item) => {
            const Icon = item.icon || FiActivity
            return (
              <div key={item.id} className="clay-list-item clay-list-item-3d flex items-center gap-3 p-3">
                <div className="clay-icon-3d flex h-9 w-9 shrink-0 items-center justify-center text-[var(--clay-primary)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--clay-primary)]">{item.title}</p>
                  <p className="truncate text-xs text-[var(--clay-primary-soft)]">{item.subtitle}</p>
                </div>
                {item.path ? (
                  <Link
                    to={item.path}
                    className="clay-action-btn flex h-8 w-8 items-center justify-center"
                    title="View"
                  >
                    <FiArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ClayAnalyticsSection({ title, children }) {
  return (
    <section className="clay-app clay-analytics-3d mb-5">
      <div className="mb-3 flex items-center gap-2">
        <FiBarChart2 className="h-4 w-4 text-[var(--clay-teal)]" />
        <span className="chart-panel-accent" aria-hidden />
        <h2 className="text-sm font-semibold text-[var(--clay-primary)]">{title}</h2>
      </div>
      {children}
    </section>
  )
}

export function formatStatValue(value) {
  if (value == null || value === '—') return '—'
  if (typeof value === 'number') return formatNumber(value)
  return String(value)
}

export function mapGrowthChart(charts) {
  const registrations = charts?.monthly_registrations || []
  if (registrations.length) {
    return registrations.map((row) => ({
      label: row.month,
      value: row.users ?? row.schools ?? 0,
    }))
  }
  const userGrowth = charts?.user_growth || []
  return userGrowth.map((row) => ({ label: row.month, value: row.count ?? 0 }))
}

export function mapDistribution(charts) {
  const dist = charts?.user_distribution
  if (!dist) return []
  if (Array.isArray(dist)) {
    return dist.map((d) => ({ label: d.label || d.name, value: d.value || d.count || 0 }))
  }
  return Object.entries(dist).map(([label, value]) => ({
    label: label.replace(/_/g, ' '),
    value: typeof value === 'number' ? value : 0,
  }))
}

export function mapSchoolEnrollment(statistics = {}) {
  return [
    { label: 'Students', value: statistics.total_students ?? 0 },
    { label: 'Teachers', value: statistics.total_teachers ?? 0 },
    { label: 'Staff', value: statistics.total_staff ?? 0 },
    { label: 'Parents', value: statistics.total_parents ?? 0 },
  ].filter((d) => d.value > 0)
}

export { FiUsers, FiBook, FiBriefcase, FiClipboard, FiLayers, FiFileText }
