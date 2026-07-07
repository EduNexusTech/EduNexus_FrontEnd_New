import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loadTenant, saveTenant } from '@/utils/storage'
import { useAuth } from './AuthContext'

const TenantContext = createContext(null)

export function TenantProvider({ children }) {
  const { user } = useAuth()
  const [tenant, setTenantState] = useState(() => loadTenant() || {})

  useEffect(() => {
    if (user?.organization_id && !tenant.organizationId) {
      setTenantState((prev) => ({
        ...prev,
        organizationId: user.organization_id,
        organizationName: user.organization_name,
      }))
    }
  }, [user, tenant.organizationId])

  const setTenant = (next) => {
    const merged = { ...tenant, ...next }
    setTenantState(merged)
    saveTenant(merged)
  }

  const value = useMemo(
    () => ({
      organizationId: tenant.organizationId,
      organizationName: tenant.organizationName,
      schoolId: tenant.schoolId,
      schoolName: tenant.schoolName,
      setTenant,
    }),
    [tenant],
  )

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used within TenantProvider')
  return ctx
}
