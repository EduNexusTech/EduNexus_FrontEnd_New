import { cn } from '@/lib/utils'

export function Checkbox({ label, description, className, checked, disabled, onChange, ...props }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        {...props}
      />
      <span className="min-w-0 flex-1">
        {label ? <span className="block text-sm font-medium text-foreground">{label}</span> : null}
        {description ? <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span> : null}
      </span>
    </label>
  )
}
