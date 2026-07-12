import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { cn } from '@/utils/format'

const fieldWrap = 'lms-field space-y-1.5'
const inputClass =
  'lms-input disabled:cursor-not-allowed disabled:bg-[var(--clay-mint-light,#f4f8f6)] disabled:text-muted'
const errorClass = 'lms-input--error'

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
    <div className={cn(fieldWrap, containerClassName)}>
      {label && (
        <label className="block text-sm font-medium">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className={cn(inputClass, 'pr-11', error && errorClass, className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted transition hover:bg-[var(--clay-mint-light,#f4f8f6)] hover:text-text"
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
    <div className={cn(fieldWrap, containerClassName)}>
      {label && (
        <label className="block text-sm font-medium">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input className={cn(inputClass, error && errorClass, className)} {...props} />
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, error, className, required, ...props }) {
  return (
    <div className={fieldWrap}>
      {label && (
        <label className="block text-sm font-medium">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea className={cn('lms-textarea', error && errorClass, className)} {...props} />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

export function SelectField({ label, error, options = [], required, className, placeholder = 'Select...', ...props }) {
  return (
    <div className={fieldWrap}>
      {label && (
        <label className="block text-sm font-medium">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select className={cn('lms-select', error && errorClass, className)} {...props}>
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
        className="h-4 w-4 rounded border-[var(--clay-border,#e2ebe6)] text-[var(--clay-sidebar,#8fb5a0)] focus:ring-[var(--clay-sidebar,#8fb5a0)]/20"
        {...props}
      />
      <span className="text-sm text-text">{label}</span>
      {error && <p className="text-xs text-danger">{error}</p>}
    </label>
  )
}
