import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { schoolService } from '@/api/services'
import { unwrapList } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import {
  filterSchoolOptionsForUser,
  getUserOrganizationId,
  getUserSchoolId,
  isSchoolAdminUser,
  mapSchoolsToOptions,
} from '@/utils/schoolScope'

/** School picker + tenant header helpers for school-scoped setup pages. */
export function useSchoolScopedSelection() {
  const { user } = useAuth()
  const userSchoolId = getUserSchoolId(user)
  const userOrgId = getUserOrganizationId(user)
  const isSchoolAdmin = isSchoolAdminUser(user)

  const schoolsQuery = useQuery({
    queryKey: ['schools-scoped-selection', userSchoolId, isSchoolAdmin],
    queryFn: () =>
      schoolService.list({
        page_size: 500,
        ordering: 'school_name',
        ...(isSchoolAdmin && userSchoolId ? { school: userSchoolId } : {}),
      }),
  })

  const allSchoolOptions = useMemo(() => {
    const { results } = unwrapList(schoolsQuery.data)
    return mapSchoolsToOptions(results)
  }, [schoolsQuery.data])

  const schoolOptions = useMemo(
    () => filterSchoolOptionsForUser(allSchoolOptions, user),
    [allSchoolOptions, user],
  )

  const [schoolId, setSchoolId] = useState(userSchoolId)

  useEffect(() => {
    if (!schoolOptions.length) return
    const currentValid = schoolId && schoolOptions.some((s) => s.value === schoolId)
    if (currentValid) return
    const byUserSchool = userSchoolId
      ? schoolOptions.find((s) => s.value === userSchoolId)
      : null
    const pick = byUserSchool || schoolOptions[0]
    if (pick?.value) setSchoolId(pick.value)
  }, [schoolOptions, schoolId, userSchoolId])

  const resolvedOrgId = useMemo(() => {
    const fromSchool = schoolOptions.find((s) => s.value === schoolId)?.organizationId || ''
    return fromSchool || userOrgId || ''
  }, [schoolOptions, schoolId, userOrgId])

  const listRequestConfig = useMemo(
    () => (resolvedOrgId ? { headers: { 'X-Tenant-ID': resolvedOrgId } } : undefined),
    [resolvedOrgId],
  )

  const selectedSchoolLabel = useMemo(
    () => schoolOptions.find((s) => s.value === schoolId)?.label || '',
    [schoolOptions, schoolId],
  )

  const schoolLocked = isSchoolAdmin || (schoolOptions.length === 1 && Boolean(schoolId))

  return {
    user,
    schoolId,
    setSchoolId,
    resolvedOrgId,
    listRequestConfig,
    schoolOptions,
    schoolsQuery,
    selectedSchoolLabel,
    isSchoolAdmin,
    schoolLocked,
  }
}

/**
 * Masters STD / Section / Map setup — extends school scope with list query params.
 */
export function useSchoolSetup() {
  const scope = useSchoolScopedSelection()
  const { schoolId, resolvedOrgId } = scope

  const listParams = useMemo(
    () => ({
      page_size: 500,
      ordering: 'sequence',
      ...(schoolId ? { school: schoolId } : {}),
      ...(resolvedOrgId ? { organization: resolvedOrgId } : {}),
    }),
    [schoolId, resolvedOrgId],
  )

  const activeListParams = useMemo(
    () => ({ ...listParams, is_active: true }),
    [listParams],
  )

  return {
    ...scope,
    listParams,
    activeListParams,
  }
}
