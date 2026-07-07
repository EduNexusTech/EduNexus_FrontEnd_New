/** Resolve primary key from list row objects across modules. */
export function resolveRecordId(item) {
  if (!item) return null
  // Entity PK fields first; organization_id is last because it is a FK on
  // schools, roles, users, etc. but only the PK on organization records.
  const keys = [
    'id',
    'audit_log_id',
    'user_id',
    'school_id',
    'role_id',
    'permission_id',
    'menu_id',
    'module_id',
    'organization_id',
  ]
  for (const key of keys) {
    if (item[key]) return item[key]
  }
  return null
}
