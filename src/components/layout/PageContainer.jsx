import { cn } from '@/utils/format'

/**
 * Full-width page shell for dashboard routes.
 * Use on every page inside DashboardLayout for consistent spacing and width.
 */
export default function PageContainer({ children, className }) {
  return (
    <div className={cn('clay-app lms-page w-full min-h-full', className)}>
      {children}
    </div>
  )
}
