import { Link } from 'react-router-dom'
import { FiArrowRight } from 'react-icons/fi'
import Card from '@/components/ui/Card'
import { cn } from '@/utils/format'

const STAT_BG = ['clay-card-glass-teal', 'clay-card-green', 'clay-card-glass-forest', 'clay-card-white']

export function HubPageShell({ children, className }) {
  return <div className={cn('lms-page w-full min-w-0', className)}>{children}</div>
}

export function HubSectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {Icon ? <Icon className="h-5 w-5 text-[var(--clay-teal)]" /> : <span className="chart-panel-accent" aria-hidden />}
      <div>
        <h2 className="text-base font-bold text-[var(--clay-text-sharp)]">{title}</h2>
        {subtitle ? <p className="text-xs text-[var(--clay-primary-soft)]">{subtitle}</p> : null}
      </div>
    </div>
  )
}

export function HubStatGrid({ stats = [] }) {
  return (
    <div className="lms-grid-hub-stats mb-6">
      {stats.map((stat, i) => (
        <Card key={stat.label} className={cn('min-w-0 p-4', STAT_BG[i % STAT_BG.length], stat.className)}>
          <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--clay-primary-soft)]">{stat.label}</p>
          <p className="mt-1 break-words text-2xl font-bold text-[var(--clay-text-sharp)]">{stat.value}</p>
        </Card>
      ))}
    </div>
  )
}

export function HubLinkCard({ to, icon: Icon, label, description, className }) {
  return (
    <Link to={to} className={cn('block h-full', className)}>
      <Card hover className="h-full">
        <div className="flex items-start gap-3">
          <div className="clay-icon-3d flex h-11 w-11 shrink-0 items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[var(--clay-text-sharp)]">{label}</p>
            {description ? <p className="mt-1 text-sm text-[var(--clay-primary-soft)]">{description}</p> : null}
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--clay-teal)]">
              Open <FiArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function HubTileCard({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="block h-full">
      <Card hover className="flex h-full items-center gap-4">
        <div className="clay-icon-3d flex h-12 w-12 shrink-0 items-center justify-center">
          <Icon className="h-6 w-6" />
        </div>
        <span className="font-bold text-[var(--clay-text-sharp)]">{label}</span>
      </Card>
    </Link>
  )
}

export function HubInfoCard({ title, children, className }) {
  return (
    <Card className={cn('lms-form-card', className)}>
      {title ? <h3 className="font-bold text-[var(--clay-text-sharp)]">{title}</h3> : null}
      <div className={title ? 'mt-2 text-sm text-[var(--clay-primary-soft)]' : ''}>{children}</div>
    </Card>
  )
}

export function SettingsNav({ items, activeKey }) {
  return (
    <nav className="space-y-1 max-h-[70vh] overflow-y-auto">
      {items.map((item) => {
        const isActive = activeKey === item.key
        return (
          <Link
            key={item.key}
            to={item.href}
            className={cn('lms-settings-nav-item block rounded-xl px-4 py-2.5 text-sm font-medium transition', isActive && 'lms-settings-nav-item--active')}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
