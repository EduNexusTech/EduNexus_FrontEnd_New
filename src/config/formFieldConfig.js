/** Maps FK form fields to human labels and detail name columns (never show raw UUIDs in UI). */

export const FK_DISPLAY_LABELS = {
  organization_id: 'Organization',
  organization: 'Organization',
  school_id: 'School',
  school: 'School',
  academic_year_id: 'Academic Year',
  academic_year: 'Academic Year',
  country: 'Country',
  state: 'State',
  city: 'City',
  board: 'Board',
  school_class: 'Class',
  section: 'Section',
  stream: 'Stream',
  curriculum: 'Curriculum',
  subject: 'Subject',
  subject_group: 'Subject Group',
  department: 'Department',
  designation: 'Designation',
  class_timing: 'Class Timing',
  class_section: 'Class Section',
  teacher: 'Teacher',
  user: 'User',
  role: 'Role',
}

export const ID_TO_NAME_FIELD = {
  organization_id: 'organization_name',
  organization: 'organization_name',
  school_id: 'school_name',
  school: 'school_name',
  academic_year_id: 'academic_year_name',
  academic_year: 'academic_year_name',
  country: 'country_name',
  state: 'state_name',
  city: 'city_name',
  board: 'board_name',
  school_class: 'class_name',
  section: 'section_name',
  stream: 'stream_name',
  curriculum: 'curriculum_name',
  subject: 'subject_name',
  subject_group: 'subject_group_name',
  department: 'department_name',
  class_timing: 'class_timing_name',
  class_section: 'class_section_label',
  teacher: 'teacher_name',
  user: 'user_name',
  role: 'role_name',
}

export const FK_FIELD_NAMES = new Set(Object.keys(FK_DISPLAY_LABELS))

/** Ensures org → school → year → other FKs follow hierarchy in forms and detail views. */
const SCOPE_FIELD_ORDER = {
  organization_id: 10,
  organization: 10,
  school_id: 20,
  school: 20,
  academic_year_id: 30,
  academic_year: 30,
  country: 40,
  state: 50,
  city: 60,
  board: 70,
  school_class: 80,
  section: 90,
  stream: 100,
  curriculum: 110,
  subject: 120,
  subject_group: 130,
  department: 140,
  designation: 150,
  class_timing: 160,
  class_section: 170,
  teacher: 180,
  user: 185,
  role: 190,
}

export function sortScopedFormFields(fields) {
  if (!fields?.length) return []
  return fields
    .map((field, index) => ({ field, index }))
    .sort((a, b) => {
      const rankA = SCOPE_FIELD_ORDER[a.field.name] ?? 1000 + a.index
      const rankB = SCOPE_FIELD_ORDER[b.field.name] ?? 1000 + b.index
      if (rankA !== rankB) return rankA - rankB
      return a.index - b.index
    })
    .map(({ field }) => field)
}

export function transformScopedLoad(item) {
  if (!item) return item
  const values = { ...item }
  FK_FIELD_NAMES.forEach((key) => {
    if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
      values[key] = String(values[key])
    }
  })
  return values
}

/** Detail modal / view: show names, hide raw ID fields. */
export function buildDetailFields(def, { formatDate } = {}) {
  const formFields = sortScopedFormFields(def?.fields || [])
  const result = []
  const added = new Set()

  const pushField = (entry) => {
    const dedupeKey = entry.key || entry.label
    if (added.has(dedupeKey)) return
    added.add(dedupeKey)
    result.push(entry)
  }

  formFields.forEach((f) => {
    const nameKey = ID_TO_NAME_FIELD[f.name]
    if (nameKey) {
      pushField({
        key: nameKey,
        label: FK_DISPLAY_LABELS[f.name] || f.label.replace(/\s*ID.*$/i, '').trim(),
        render: (item) => {
          const val = item[nameKey]
          if (val !== undefined && val !== null && val !== '') return val
          if (f.name === 'class_section') {
            const combo = [item.class_name, item.section_name].filter(Boolean).join(' — ')
            if (combo) return combo
          }
          return '—'
        },
      })
      return
    }

    if (f.type === 'checkbox') {
      pushField({
        key: f.name,
        label: f.label,
        render: (item) => (item[f.name] ? 'Yes' : 'No'),
      })
      return
    }

    if (f.type === 'password') return

    pushField({
      key: f.name,
      label: f.label,
      fullWidth: f.fullWidth,
      render: (item) => {
        const val = item[f.name]
        return val !== undefined && val !== null && val !== '' ? val : '—'
      },
    })
  })

  pushField({
    key: 'created_at',
    label: 'Created',
    render: (item) => {
      const val = item.created_at
      if (!val) return '—'
      return formatDate ? formatDate(val) : val
    },
  })

  return result
}
