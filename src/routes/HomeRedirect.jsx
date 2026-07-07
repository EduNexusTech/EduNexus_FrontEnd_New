import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { PageLoader } from '@/components/ui/Feedback'

export default function HomeRedirect() {
  const { isAuthenticated, isHydrated } = useAuth()

  if (!isHydrated) return <PageLoader />

  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
}
