/** Resolve primary key from list row objects across modules. */
const ENTITY_PK_PRIORITY = [
  'user_id',
  'school_id',
  'role_id',
  'permission_id',
  'menu_id',
  'module_id',
  'organization_id',
  'audit_log_id',
  'country_id',
  'state_id',
  'city_id',
  'board_id',
  'class_id',
  'section_id',
  'subject_id',
  'department_id',
  'designation_id',
  'category_id',
]

export function resolveRecordId(item) {
  if (!item) return null

  for (const key of ENTITY_PK_PRIORITY) {
    if (item[key]) return item[key]
  }

  if (item.id) return item.id

  const dynamicIdKey = Object.keys(item).find((key) => key.endsWith('_id') && item[key])
  return dynamicIdKey ? item[dynamicIdKey] : null
}
