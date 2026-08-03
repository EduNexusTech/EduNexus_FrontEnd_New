import { resolveRecordId } from '@/utils/record'

/** Normalize school id from user profile or API row. */
export function getUserSchoolId(user) {
  if (!user) return ''
  const raw = user.school_id ?? user.school
  if (!raw) return ''
  if (typeof raw === 'object') {
    return String(raw.id || raw.school_id || '')
  }
  return String(raw)
}

export function getUserOrganizationId(user) {
  if (!user) return ''
  const raw = user.organization_id ?? user.organization
  if (!raw) return ''
  if (typeof raw === 'object') return String(raw.id || '')
  return String(raw)
}

export function isSchoolAdminUser(user) {
  const schoolId = getUserSchoolId(user)
  return Boolean(user?.is_school_admin && schoolId)
}

export function mapSchoolsToOptions(results) {
  return (results || []).map((s) => ({
    value: String(resolveRecordId(s) || s.id || s.school_id || ''),
    label: s.school_name || s.name || 'School',
    organizationId: String(
      s.organization_id ||
        (typeof s.organization === 'object' ? s.organization?.id : s.organization) ||
        '',
    ),
  }))
}

/** School admins only see their assigned school in dropdowns. */
export function filterSchoolOptionsForUser(options, user) {
  if (!isSchoolAdminUser(user)) return options

  const userSchoolId = getUserSchoolId(user)
  const mine = (options || []).filter((s) => s.value === userSchoolId)
  if (mine.length) return mine

  if (userSchoolId) {
    return [
      {
        value: userSchoolId,
        label: user?.school_name || user?.school?.school_name || 'My school',
        organizationId: getUserOrganizationId(user),
      },
    ]
  }

  return []
}
