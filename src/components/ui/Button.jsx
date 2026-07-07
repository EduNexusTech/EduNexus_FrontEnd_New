import { cn } from '@/utils/format'

const variants = {
  primary: 'gradient-primary text-white hover:opacity-95 shadow-md shadow-primary/20',
  secondary: 'bg-white text-text border border-border hover:bg-slate-50',
  danger: 'bg-danger text-white hover:bg-red-600',
  ghost: 'bg-transparent text-muted hover:bg-slate-100 hover:text-text',
  outline: 'border-2 border-primary text-primary hover:bg-primary/5',
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
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
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
