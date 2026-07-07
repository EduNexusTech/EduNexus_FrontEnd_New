import { cn } from '@/utils/format'

export default function Input({
  label,
  error,
  hint,
  className,
  containerClassName,
  required,
  ...props
}) {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        className={cn(
          'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text placeholder:text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20',
          error && 'border-danger focus:border-danger focus:ring-danger/20',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, required, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text placeholder:text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-[100px]',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

export function SelectField({ label, error, options = [], required, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20',
          error && 'border-danger',
          className,
        )}
        {...props}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

export function CheckboxField({ label, error, ...props }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
        {...props}
      />
      <span className="text-sm text-text">{label}</span>
      {error && <p className="text-xs text-danger">{error}</p>}
    </label>
  )
}
