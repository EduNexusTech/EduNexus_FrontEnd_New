import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { cn } from '@/utils/format'

export function PasswordInput({
  label,
  error,
  hint,
  className,
  containerClassName,
  required,
  value,
  onChange,
  ...props
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-text">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={cn(
            'w-full rounded-xl border border-border bg-white px-4 py-2.5 pr-11 text-sm text-text placeholder:text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted transition hover:bg-slate-100 hover:text-text"
          title={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

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

export function SelectField({ label, error, options = [], required, className, placeholder = 'Select...', ...props }) {
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
          'w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-muted',
          error && 'border-danger',
          className,
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
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
