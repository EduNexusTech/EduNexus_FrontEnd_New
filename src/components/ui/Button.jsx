import { cn } from '@/utils/format'

const variants = {
  primary: 'lms-btn-primary',
  save: 'lms-btn-save',
  create: 'lms-btn-create',
  add: 'lms-btn-add',
  edit: 'lms-btn-edit',
  view: 'lms-btn-view',
  success: 'lms-btn-success',
  finish: 'lms-btn-finish',
  danger: 'lms-btn-danger',
  delete: 'lms-btn-delete',
  cancel: 'lms-btn-cancel',
  secondary: 'lms-btn-filter',
  filter: 'lms-btn-filter',
  refresh: 'lms-btn-refresh',
  search: 'lms-btn-search',
  'reset-filter': 'lms-btn-reset-filter',
  clear: 'lms-btn-clear',
  excel: 'lms-btn-excel',
  pdf: 'lms-btn-pdf',
  csv: 'lms-btn-csv',
  print: 'lms-btn-print',
  download: 'lms-btn-download',
  upload: 'lms-btn-upload',
  previous: 'lms-btn-previous',
  next: 'lms-btn-next',
  back: 'lms-btn-back',
  continue: 'lms-btn-continue',
  outline: 'lms-btn-outline',
  ghost: 'bg-transparent text-[var(--clay-primary-soft)] hover:bg-slate-100 hover:text-[var(--clay-text-sharp)]',
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
  const isSolid = variant !== 'ghost' && variant !== 'outline'

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant] || variants.primary,
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span
          className={cn(
            'h-4 w-4 animate-spin rounded-full border-2',
            isSolid ? 'border-white/30 border-t-white' : 'border-slate-300 border-t-slate-600',
          )}
        />
      )}
      {children}
    </button>
  )
}
