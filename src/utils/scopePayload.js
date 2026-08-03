import { getUserOrganizationId, getUserSchoolId } from '@/utils/schoolScope'

const SCOPE_KEYS = [
  'organization_id',
  'organization',
  'school_id',
  'school',
  'academic_year_id',
  'academic_year',
]

const ORG_FIELD_NAMES = new Set(['organization_id', 'organization'])
const SCHOOL_FIELD_NAMES = new Set(['school_id', 'school'])

function fieldNamesFromDef(fields) {
  return new Set((fields || []).map((f) => f.name))
}

/** Pre-fill org/school on create forms for scoped users. */
export function getScopedCreateDefaults(user, fields, { isSuperAdmin = false } = {}) {
  const defaults = {}
  const fieldNames = fieldNamesFromDef(fields)
  const orgId = getUserOrganizationId(user)
  const schoolId = getUserSchoolId(user)

  if (!isSuperAdmin && orgId) {
    if (fieldNames.has('organization_id')) defaults.organization_id = orgId
    if (fieldNames.has('organization')) defaults.organization = orgId
  }
  if (schoolId) {
    if (fieldNames.has('school_id')) defaults.school_id = schoolId
    if (fieldNames.has('school')) defaults.school = schoolId
  }

  return defaults
}

/** Ensure API receives organization_id / school_id for scoped admins. */
export function buildScopedPayload(values, user, fields, { isSuperAdmin = false } = {}) {
  const payload = { ...values }
  const fieldNames = fieldNamesFromDef(fields)
  const orgId = getUserOrganizationId(user)
  const schoolId = getUserSchoolId(user)

  const needsOrg =
    fieldNames.has('organization_id') ||
    fieldNames.has('organization') ||
    !fields?.length
  const needsSchool =
    fieldNames.has('school_id') ||
    fieldNames.has('school') ||
    !fields?.length

  if (
    needsOrg &&
    !payload.organization_id &&
    !payload.organization &&
    orgId &&
    !isSuperAdmin
  ) {
    payload.organization_id = orgId
  }

  if (needsSchool && !payload.school_id && !payload.school && schoolId) {
    payload.school_id = schoolId
  }

  SCOPE_KEYS.forEach((key) => {
    if (payload[key] === '' || payload[key] == null) {
      delete payload[key]
    }
  })

  return payload
}

export function formHasOrgField(fields) {
  return (fields || []).some((f) => ORG_FIELD_NAMES.has(f.name))
}

export function formHasSchoolField(fields) {
  return (fields || []).some((f) => SCHOOL_FIELD_NAMES.has(f.name))
}

/** @deprecated use getScopedCreateDefaults */
export const getMasterCreateDefaults = getScopedCreateDefaults

/** @deprecated use buildScopedPayload */
export const buildMasterScopePayload = buildScopedPayload
