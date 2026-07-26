/** Shared helpers for school-scoped STD / Section / Map setup under Masters. */

export const STD_PRESETS = [
  { name: 'Nursery', code: 'nursery', sequence: 0 },
  { name: 'LKG', code: 'lkg', sequence: 1 },
  { name: 'UKG', code: 'ukg', sequence: 2 },
  ...Array.from({ length: 12 }, (_, i) => ({
    name: `Class ${i + 1}`,
    code: `class_${i + 1}`,
    sequence: i + 3,
  })),
]

export const SECTION_PRESETS = ['A', 'B', 'C', 'D'].map((letter, i) => ({
  name: letter,
  code: letter.toLowerCase(),
  sequence: i + 1,
}))

export function toCode(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function emptyStdRow(sequence = 1) {
  return { name: '', code: '', sequence }
}

export function emptySectionRow(sequence = 1) {
  return { name: '', code: '', sequence }
}

export function pairKey(classId, sectionId) {
  return `${classId}::${sectionId}`
}

export const SETUP_NAV = [
  { key: 'standards', label: '1. Standards', path: '/masters/setup/standards' },
  { key: 'sections', label: '2. Sections', path: '/masters/setup/sections' },
  { key: 'map', label: '3. Map', path: '/masters/setup/map' },
]
