import { useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { buildScopedPayload, getScopedCreateDefaults } from '@/utils/scopePayload'

/**
 * Shared hook for CRUD forms — auto-injects org/school from logged-in user.
 * Super admins must still pick organization when the form has an org field.
 */
export function useScopedFormSubmit(fields, customTransform) {
  const { user, isSuperAdmin } = useAuth()

  const getCreateDefaults = useCallback(
    () => getScopedCreateDefaults(user, fields, { isSuperAdmin }),
    [user, fields, isSuperAdmin],
  )

  const transformSubmit = useCallback(
    (values) => {
      let payload = buildScopedPayload(values, user, fields, { isSuperAdmin })
      if (customTransform) {
        payload = customTransform(payload)
      }
      return payload
    },
    [user, fields, isSuperAdmin, customTransform],
  )

  return { getCreateDefaults, transformSubmit, user, isSuperAdmin }
}
