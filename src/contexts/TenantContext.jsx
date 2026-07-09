import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { loadTenant, saveTenant, clearTenant } from '@/utils/storage'
import { useAuth } from './AuthContext'

const TenantContext = createContext(null)

function buildTenantFromUser(user) {
  if (!user) return {}
  return {
    organizationId: user.organization_id || null,
    organizationName: user.organization_name || null,
    schoolId: user.school_id || null,
    schoolName: user.school_name || null,
  }
}

function resolveUserId(user) {
  if (!user) return null
  return user.user_id || user.id || user.email || null
}

export function TenantProvider({ children }) {
  const { user } = useAuth()
  const [tenant, setTenantState] = useState(() => loadTenant() || {})
  const lastUserIdRef = useRef(resolveUserId(user))

  useEffect(() => {
    const currentUserId = resolveUserId(user)
    const userChanged = currentUserId !== lastUserIdRef.current

    if (!user) {
      setTenantState({})
      clearTenant()
      lastUserIdRef.current = null
      return
    }

    if (userChanged) {
      const next = buildTenantFromUser(user)
      setTenantState(next)
      saveTenant(next)
      lastUserIdRef.current = currentUserId
      return
    }

    if (user.organization_id && !tenant.organizationId) {
      const next = {
        ...tenant,
        ...buildTenantFromUser(user),
      }
      setTenantState(next)
      saveTenant(next)
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
