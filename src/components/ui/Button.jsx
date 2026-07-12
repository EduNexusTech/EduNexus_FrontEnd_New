import { cn } from '@/utils/format'

const variants = {
  primary: 'lms-btn-primary shadow-sm hover:opacity-95',
  secondary: 'lms-btn-secondary',
  danger: 'bg-danger text-white hover:bg-red-600',
  ghost: 'bg-transparent text-[var(--clay-primary-soft)] hover:bg-[var(--clay-mint-light)] hover:text-[var(--clay-primary)]',
  outline: 'border border-[var(--clay-sidebar,#8fb5a0)] text-[var(--clay-primary,#3f5249)] hover:bg-[var(--clay-mint-light,#f4f8f6)]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {children}
    </button>
  )
}
