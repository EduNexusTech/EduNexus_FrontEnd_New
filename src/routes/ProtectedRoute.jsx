import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/ui/Feedback'

export default function ProtectedRoute({ requireSuperAdmin = false }) {
  const { isAuthenticated, isHydrated, isSuperAdmin } = useAuth()

  if (!isHydrated) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { isAuthenticated, isHydrated } = useAuth()

  if (!isHydrated) return <PageLoader />

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
