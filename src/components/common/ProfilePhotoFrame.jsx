import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/utils/format'

const FRAME = 'h-48 w-36 sm:h-56 sm:w-44 shrink-0 border border-sky-200 bg-white shadow-sm object-contain rounded-none'

/**
 * Full rectangular profile photo (no circle crop).
 */
export default function ProfilePhotoFrame({
  src,
  alt = 'Profile photo',
  emptyLabel = 'No photo',
  className,
  frameClassName,
}) {
  const url = resolveMediaUrl(src)

  if (url) {
    return (
      <img
        src={url}
        alt={alt}
        className={cn(FRAME, frameClassName, className)}
      />
    )
  }

  return (
    <div
      className={cn(
        FRAME,
        'flex items-center justify-center border-dashed bg-sky-50 text-xs text-muted text-center px-2',
        frameClassName,
        className,
      )}
    >
      {emptyLabel}
    </div>
  )
}
