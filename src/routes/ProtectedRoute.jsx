import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { bootstrapStoredSession } from '@/utils/authSession'

/**
 * Route guard — re-reads storage when context is not yet authenticated (instant redirect).
 */
function useAuthGuard() {
  const ctx = useAuth()

  if (ctx.isAuthenticated) {
    return ctx
  }

  const saved = bootstrapStoredSession()
  if (saved?.accessToken) {
    return {
      ...ctx,
      isAuthenticated: true,
      isSuperAdmin: Boolean(saved.user?.is_super_admin),
    }
  }

  return ctx
}

export default function ProtectedRoute({ requireSuperAdmin = false }) {
  const { isAuthenticated, isSuperAdmin } = useAuthGuard()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function PublicRoute() {
  const { isAuthenticated } = useAuthGuard()

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
