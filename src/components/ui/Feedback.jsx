import { FiInbox, FiAlertCircle, FiRefreshCw } from 'react-icons/fi'
import { cn } from '@/utils/format'
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
      <div className="clay-icon-3d mb-4 flex h-14 w-14 items-center justify-center">
        <Icon className="h-7 w-7 text-[var(--clay-teal)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--clay-primary)]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-[var(--clay-primary-soft)]">{description}</p>}
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
        <Button variant="refresh" className="mt-4" onClick={onRetry}>
          <FiRefreshCw className="h-4 w-4" /> Try again
        </Button>
      )}
    </div>
  )
}

const STATUS_CLASS = {
  active: 'lms-status-active',
  inactive: 'lms-status-inactive',
  pending: 'lms-status-pending',
  approved: 'lms-status-approved',
  rejected: 'lms-status-rejected',
  draft: 'lms-status-draft',
}

const STATUS_LABEL = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  draft: 'Draft',
}

function resolveStatusKey(active, status) {
  if (status) {
    const key = String(status).toLowerCase()
    if (STATUS_CLASS[key]) return key
  }
  if (active === true || active === 'active' || active === 'Active') return 'active'
  if (active === false || active === 'inactive' || active === 'Inactive') return 'inactive'
  return 'inactive'
}

export function StatusBadge({ active, status, label }) {
  const key = resolveStatusKey(active, status)
  const text = label || STATUS_LABEL[key] || String(status || (active ? 'Active' : 'Inactive'))

  return (
    <span className={cn('lms-status-badge', STATUS_CLASS[key] || STATUS_CLASS.inactive)}>
      {text}
    </span>
  )
}

export function Avatar({ name, src, size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-20 w-20 text-xl',
    '2xl': 'h-28 w-28 text-2xl',
  }
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(`rounded-full object-cover ring-2 ring-white shadow-sm ${sizes[size]}`, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        `rounded-full lms-btn-primary flex items-center justify-center text-white font-semibold ring-2 ring-white shadow-sm ${sizes[size]}`,
        className,
      )}
    >
      {initials || '?'}
    </div>
  )
}
