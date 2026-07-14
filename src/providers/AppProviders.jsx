import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { TenantProvider } from '@/contexts/TenantContext'
import AppRoutes from '@/routes/AppRoutes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
})

export default function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TenantProvider>
            {children || <AppRoutes />}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.55)',
                  backdropFilter: 'blur(20px) saturate(1.7)',
                  WebkitBackdropFilter: 'blur(20px) saturate(1.7)',
                  color: '#061410',
                  border: '1px solid rgba(255, 255, 255, 0.75)',
                  boxShadow: '0 8px 28px rgba(30, 77, 58, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
                  fontWeight: 600,
                },
              }}
            />
          </TenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
