import { cn } from '@/lib/utils'

/**
 * Page content wrapper — layout handles outer padding; use for optional inner width constraints.
 */
export default function PageContainer({ children, className }) {
  return <div className={cn('lms-page w-full min-h-full min-w-0 space-y-6', className)}>{children}</div>
}
