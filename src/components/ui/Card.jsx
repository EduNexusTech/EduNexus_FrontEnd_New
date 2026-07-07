import { cn } from '@/utils/format'

export default function Card({ children, className, padding = true, hover = false }) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white border border-border card-shadow',
        padding && 'p-6',
        hover && 'transition hover:shadow-lg hover:-translate-y-0.5',
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
    primary: 'from-primary/10 to-secondary/10 text-primary',
    success: 'from-green-50 to-emerald-50 text-success',
    warning: 'from-amber-50 to-orange-50 text-warning',
    accent: 'from-cyan-50 to-sky-50 text-accent',
  }

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 text-3xl font-bold text-text">{value}</p>
          {change && <p className="mt-1 text-xs text-muted">{change}</p>}
        </div>
        {Icon && (
          <div className={cn('rounded-xl p-3 bg-gradient-to-br', colors[color])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </Card>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}
