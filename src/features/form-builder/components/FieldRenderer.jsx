import { cn } from '@/lib/utils'
import { FiImage } from 'react-icons/fi'
import RichTextContent from './RichTextContent'
import { hasRichFormatting } from '../utils/richText'

const btnClass = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  outline: 'border border-border bg-white text-foreground hover:bg-muted',
}

function RichLabel({ field, mode }) {
  if (!field.label || ['divider', 'spacer', 'hidden'].includes(field.type)) return null
  if (hasRichFormatting(field.label)) {
    return (
      <div className="text-sm font-medium text-foreground">
        <RichTextContent html={field.label} />
        {field.required && mode === 'fill' ? <span className="text-red-500"> *</span> : null}
        {field.required && mode === 'design' ? (
          <span className="ml-1 text-xs font-normal text-muted-foreground">(required)</span>
        ) : null}
      </div>
    )
  }
  return (
    <label className="block text-sm font-medium text-foreground">
      {field.label}
      {field.required && mode === 'fill' ? <span className="text-red-500"> *</span> : null}
      {field.required && mode === 'design' ? (
        <span className="ml-1 text-xs font-normal text-muted-foreground">(required)</span>
      ) : null}
    </label>
  )
}

export default function FieldRenderer({
  field,
  mode = 'design',
  value,
  onChange,
  schoolName,
  logoUrl,
  error,
}) {
  const readOnly = mode === 'design' || mode === 'preview'
  const disabled = mode === 'preview'

  const wrap = (children, className) => (
    <div className={cn('space-y-1.5', className)}>
      {children}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {field.helpText && mode !== 'design' ? (
        <RichTextContent
          html={field.helpText}
          className="text-xs text-muted-foreground"
          as="div"
        />
      ) : null}
    </div>
  )

  const label = field.type !== 'checkbox' ? <RichLabel field={field} mode={mode} /> : null

  switch (field.type) {
    case 'logo':
      return (
        <div className="flex justify-center py-2">
          {(field.imageUrl || logoUrl) ? (
            <img src={field.imageUrl || logoUrl} alt="School logo" className="h-16 w-auto object-contain" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground">
              <FiImage className="h-6 w-6" />
            </div>
          )}
        </div>
      )
    case 'school-name':
      return (
        <div className="text-center">
          <RichTextContent
            html={field.content}
            fallback={schoolName || 'School Name'}
            className="text-xl font-bold text-brand-700"
            as="h2"
          />
        </div>
      )
    case 'heading':
      return (
        <RichTextContent
          html={field.content}
          fallback={field.label}
          className="text-2xl font-bold text-foreground"
          as="h1"
        />
      )
    case 'subheading':
      return (
        <RichTextContent
          html={field.content}
          fallback={field.label}
          className="text-lg font-semibold text-foreground"
          as="h2"
        />
      )
    case 'paragraph':
      return (
        <RichTextContent
          html={field.content}
          fallback={field.label}
          className="text-sm leading-relaxed text-muted-foreground"
          as="div"
        />
      )
    case 'divider':
      return <hr className="border-border" />
    case 'spacer':
      return <div className="h-6" aria-hidden />
    case 'image':
      return (
        <div className="overflow-hidden rounded-lg border border-border">
          {field.imageUrl ? (
            <img src={field.imageUrl} alt={field.label} className="max-h-40 w-full object-cover" />
          ) : (
            <div className="flex h-28 items-center justify-center bg-muted/40 text-sm text-muted-foreground">
              Banner image placeholder
            </div>
          )}
        </div>
      )
    case 'textarea':
      return wrap(
        <>
          {label}
          <textarea
            rows={4}
            readOnly={readOnly}
            disabled={disabled}
            placeholder={field.placeholder}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </>,
      )
    case 'select':
      return wrap(
        <>
          {label}
          <select
            disabled={disabled || readOnly}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">{field.placeholder || 'Select...'}</option>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </>,
      )
    case 'radio':
      return wrap(
        <>
          {label}
          <div className="space-y-2">
            {(field.options || []).map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  disabled={disabled || readOnly}
                  checked={value === opt.value}
                  onChange={() => onChange?.(opt.value)}
                  className="text-brand-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </>,
      )
    case 'checkbox':
      return wrap(
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            disabled={disabled || readOnly}
            checked={Boolean(value)}
            onChange={(e) => onChange?.(e.target.checked)}
            className="mt-0.5 shrink-0 rounded text-brand-600"
          />
          <span className="min-w-0 flex-1">
            {hasRichFormatting(field.label) ? (
              <RichTextContent html={field.label} as="span" />
            ) : (
              field.label
            )}
            {field.required && mode === 'fill' ? <span className="text-red-500"> *</span> : null}
          </span>
        </label>,
      )
    case 'checkbox-group':
      return wrap(
        <>
          {label}
          <div className="space-y-2">
            {(field.options || []).map((opt) => {
              const selected = Array.isArray(value) ? value : []
              const checked = selected.includes(opt.value)
              return (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    disabled={disabled || readOnly}
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...selected, opt.value]
                        : selected.filter((v) => v !== opt.value)
                      onChange?.(next)
                    }}
                    className="rounded text-brand-600"
                  />
                  {opt.label}
                </label>
              )
            })}
          </div>
        </>,
      )
    case 'file':
      return wrap(
        <>
          {label}
          <input
            type="file"
            accept={field.accept}
            disabled={disabled || readOnly}
            onChange={(e) => onChange?.(e.target.files?.[0]?.name || '')}
            className="w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700"
          />
        </>,
      )
    case 'hidden':
      return mode === 'design' ? (
        <div className="rounded border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Hidden field: {field.label}
        </div>
      ) : (
        <input type="hidden" name={field.id} value={field.defaultValue || ''} />
      )
    case 'submit':
    case 'reset':
    case 'button':
      return (
        <button
          type={field.type === 'submit' ? 'submit' : field.type === 'reset' ? 'reset' : 'button'}
          disabled={disabled || (mode === 'design')}
          className={cn(
            'rounded-lg px-5 py-2.5 text-sm font-medium transition-colors',
            btnClass[field.buttonVariant] || btnClass.primary,
          )}
        >
          {field.label}
        </button>
      )
    default: {
      const inputType = ['email', 'tel', 'url', 'password', 'number', 'date', 'time', 'datetime-local', 'color', 'range'].includes(field.type)
        ? field.type
        : 'text'
      return wrap(
        <>
          {label}
          <input
            type={inputType}
            readOnly={readOnly}
            disabled={disabled}
            placeholder={field.placeholder}
            value={value ?? field.defaultValue ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </>,
      )
    }
  }
}
