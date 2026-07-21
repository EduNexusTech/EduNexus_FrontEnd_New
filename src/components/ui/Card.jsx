import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Card = forwardRef(function Card({ className, children, padding = true, hover = false, ...props }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground shadow-[var(--shadow-card)] min-w-0',
        padding && 'p-6',
        hover && 'transition-shadow hover:shadow-[var(--shadow-elevated)]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
})

export const CardHeader = forwardRef(function CardHeader({ className, ...props }, ref) {
  return <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
})

export const CardTitle = forwardRef(function CardTitle({ className, ...props }, ref) {
  return (
    <h3
      ref={ref}
      className={cn('card-title text-lg font-bold leading-none tracking-tight text-black', className)}
      {...props}
    />
  )
})

export const CardDescription = forwardRef(function CardDescription({ className, ...props }, ref) {
  return (
    <p ref={ref} className={cn('card-description text-sm font-bold text-black', className)} {...props} />
  )
})

export const CardContent = forwardRef(function CardContent({ className, ...props }, ref) {
  return <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
})

export default Card

export function StatCard({ title, value, change, icon: Icon, color = 'primary' }) {
  const iconBg = {
    primary: 'bg-brand-50 text-brand-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-amber-50 text-amber-600',
    accent: 'bg-brand-50 text-brand-600',
  }

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-bold text-black">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-black">{value}</p>
          {change ? <p className="text-xs font-bold text-black">{change}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', iconBg[color])}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </Card>
  )
}

export { PageHeader } from '@/components/common/PageHeader'
