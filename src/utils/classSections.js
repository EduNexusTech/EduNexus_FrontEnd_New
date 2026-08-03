/** Shared sort + labels for Class — Section dropdowns. */

export const CLASS_SECTION_ORDERING =
  'school_class__sequence,school_class__name,section__sequence,section__name'

function classSequence(row) {
  const raw =
    row?.class_sequence ??
    row?.school_class_sequence ??
    row?.school_class?.sequence
  return Number.isFinite(Number(raw)) ? Number(raw) : 999999
}

function sectionSequence(row) {
  const raw = row?.section_sequence ?? row?.section?.sequence
  return Number.isFinite(Number(raw)) ? Number(raw) : 999999
}

function compareText(a, b) {
  return String(a || '').localeCompare(String(b || ''), undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

/** Sort class sections: STD sequence → class name → section sequence → section name. */
export function sortClassSections(sections) {
  return [...(sections || [])].sort((a, b) => {
    const seqDiff = classSequence(a) - classSequence(b)
    if (seqDiff !== 0) return seqDiff

    const classDiff = compareText(a.class_name, b.class_name)
    if (classDiff !== 0) return classDiff

    const sectionSeqDiff = sectionSequence(a) - sectionSequence(b)
    if (sectionSeqDiff !== 0) return sectionSeqDiff

    return compareText(a.section_name, b.section_name)
  })
}

export function classSectionLabel(row) {
  return [row?.class_name, row?.section_name].filter(Boolean).join(' — ') || 'Class section'
}

export function mapClassSectionOptions(sections, { includeCount = false, countLabel = '' } = {}) {
  return sortClassSections(sections).map((row) => {
    const count = row.enrolled_count ?? row.strength
    const countText =
      includeCount && count != null
        ? ` (${count}${countLabel ? ` ${countLabel}` : ''})`
        : ''
    return {
      label: `${classSectionLabel(row)}${countText}`,
      value: String(row.id),
    }
  })
}

/** Normalize class labels from spreadsheets (Grade 1, Class 5, STD-1 → comparable tokens). */
export function normalizeClassImportLabel(value) {
  let text = String(value || '').trim().toLowerCase()
  if (!text) return ''
  text = text.replace(/[-_]+/g, ' ')
  text = text.replace(/^(grade|class|std|standard|year)\s*[-.]?\s*/i, '')
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

export function normalizeSectionImportLabel(value) {
  return String(value || '').trim().toLowerCase()
}

function classSectionLookupKeys(className, sectionName, classSequence) {
  const section = normalizeSectionImportLabel(sectionName)
  if (!section) return []

  const rawClass = String(className || '').trim().toLowerCase()
  const normalizedClass = normalizeClassImportLabel(className)
  const keys = new Set()

  if (rawClass) keys.add(`${rawClass}|${section}`)
  if (normalizedClass && normalizedClass !== rawClass) {
    keys.add(`${normalizedClass}|${section}`)
  }
  if (classSequence != null && classSequence !== '') {
    keys.add(`${String(classSequence).trim().toLowerCase()}|${section}`)
  }

  return [...keys]
}

/** Build a lookup map for bulk import class + section resolution. */
export function buildClassSectionImportMap(sections) {
  const map = new Map()

  for (const row of sections || []) {
    const keys = classSectionLookupKeys(
      row.class_name,
      row.section_name,
      row.class_sequence ?? row.school_class?.sequence,
    )
    for (const key of keys) {
      if (!map.has(key)) map.set(key, row.id)
    }
  }

  return map
}

export function resolveClassSectionImportId(map, className, sectionName) {
  const keys = classSectionLookupKeys(className, sectionName)
  for (const key of keys) {
    const id = map.get(key)
    if (id) return id
  }
  return null
}

export function formatClassSectionImportHint(sections, limit = 12) {
  const labels = [...new Set((sections || []).map((row) => classSectionLabel(row)))]
  if (!labels.length) return 'No active class sections for the current academic year.'
  const shown = labels.slice(0, limit).join(', ')
  return labels.length > limit ? `${shown}, …` : shown
}
