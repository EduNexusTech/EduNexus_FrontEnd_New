import { cn } from '@/utils/format'

export default function Card({ children, className, padding = true, hover = false }) {
  return (
    <div
      className={cn(
        'clay-card clay-card-white border-0',
        padding && 'p-6',
        hover && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  )
}

export { Card }

export function StatCard({ title, value, change, icon: Icon, color = 'primary' }) {
  const colors = {
    primary: 'clay-card-mint text-[var(--clay-primary)]',
    success: 'clay-card-green text-[var(--clay-primary)]',
    warning: 'clay-card-pale text-[var(--clay-primary)]',
    accent: 'clay-card-accent text-[var(--clay-primary)]',
  }

  return (
    <Card hover className={cn('relative overflow-hidden', colors[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--clay-text-sharp)]">{title}</p>
          <p className="mt-2 text-2xl font-bold text-[var(--clay-text-sharp)]">{value}</p>
          {change && <p className="mt-1 text-xs font-medium text-[var(--clay-primary-soft)]">{change}</p>}
        </div>
        {Icon && (
          <div className="clay-icon-3d flex h-12 w-12 items-center justify-center text-[var(--clay-primary)]">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  )
}

/** Page title is shown in the top Header — this renders subtitle and actions only. */
export function PageHeader({ title: _title, subtitle, actions }) {
  if (!subtitle && !actions) return null

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {subtitle ? (
        <p className="text-sm font-semibold text-[var(--clay-primary-soft)]">{subtitle}</p>
      ) : (
        <span />
      )}
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  )
}
