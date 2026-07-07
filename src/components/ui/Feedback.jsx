import { FiInbox, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import Button from './Button'

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-primary/20 border-t-primary ${sizes[size]}`} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-10 flex-1 shimmer rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ title = 'No data found', description, action, icon: Icon = FiInbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-2xl bg-slate-100 p-4 mb-4">
        <Icon className="h-8 w-8 text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center py-16 text-center">
      <div className="rounded-2xl bg-red-50 p-4 mb-4">
        <FiAlertCircle className="h-8 w-8 text-danger" />
      </div>
      <h3 className="text-lg font-semibold text-text">Something went wrong</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          <FiRefreshCw className="h-4 w-4" /> Try again
        </Button>
      )}
    </div>
  )
}

export function StatusBadge({ active, label }) {
  const isActive = active === true || active === 'active' || active === 'Active'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-muted'
      }`}
    >
      {label || (isActive ? 'Active' : 'Inactive')}
    </span>
  )
}

export function Avatar({ name, src, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base' }
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (src) {
    return <img src={src} alt={name} className={`rounded-full object-cover ${sizes[size]}`} />
  }

  return (
    <div className={`rounded-full gradient-primary flex items-center justify-center text-white font-semibold ${sizes[size]}`}>
      {initials || '?'}
    </div>
  )
}
