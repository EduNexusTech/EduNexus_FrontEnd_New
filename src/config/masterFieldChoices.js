/** Valid choice values + aliases for master bulk import (mirrors backend constants). */

export const SUBJECT_TYPE_VALUES = [
  'core',
  'elective',
  'language',
  'optional',
  'additional',
  'practical',
  'theory',
  'activity',
  'skill',
  'vocational',
]

export const SUBJECT_TYPE_ALIASES = {
  compulsory: 'core',
  mandatory: 'core',
  main: 'core',
  electives: 'elective',
  lang: 'language',
  languages: 'language',
  lab: 'practical',
  labs: 'practical',
  extra: 'activity',
  co_curricular: 'activity',
  cocurricular: 'activity',
}

export const SUBJECT_TYPE_OPTIONS = SUBJECT_TYPE_VALUES.map((value) => ({
  label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  value,
}))

export function normalizeChoiceValue(raw, choices, aliases = {}) {
  if (raw === '' || raw === null || raw === undefined) return raw
  const text = String(raw).trim()
  let normalized = text.toLowerCase().replace(/[\s-]+/g, '_')
  if (aliases[normalized]) normalized = aliases[normalized]
  if (choices.includes(normalized)) return normalized

  const labelMatch = choices.find(
    (c) => c.replace(/_/g, ' ').toLowerCase() === text.toLowerCase(),
  )
  if (labelMatch) return labelMatch

  throw new Error(
    `"${text}" is not valid. Allowed: ${choices.join(', ')}`,
  )
}

export function formatChoicesHint(choices) {
  return choices.join(', ')
}
