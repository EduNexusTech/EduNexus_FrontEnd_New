import { cn } from '@/utils/format'
import { APP_NAME } from '@/config/constants'

const VARIANTS = {
  icon: {
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-16 w-16',
  },
  full: {
    sm: 'w-32',
    md: 'w-40',
    lg: 'w-48',
    xl: 'w-52',
  },
}

export default function BrandLogo({
  size = 'md',
  variant = 'icon',
  showName = false,
  subtitle,
  className,
  imageClassName,
}) {
  const boxClass = VARIANTS[variant]?.[size] ?? VARIANTS.icon.md
  const isFull = variant === 'full'

  const logo = (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center',
        boxClass,
        className,
      )}
    >
      <img
        src="/edunexus-infinity-logo.png"
        alt={`${APP_NAME} logo`}
        className={cn(
          'object-contain object-center',
          isFull ? 'h-auto w-full max-h-32' : 'max-h-full max-w-full',
          imageClassName,
        )}
        draggable={false}
      />
    </div>
  )

  if (!showName) return logo

  return (
    <div className="flex items-center gap-3">
      {logo}
      {!isFull && (
        <div>
          <span className="block text-lg font-bold text-[#111827]">{APP_NAME}</span>
          {subtitle && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
