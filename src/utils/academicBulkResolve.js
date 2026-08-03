import { unwrapList } from '@/api/client'
import { academicServices, masterServices, userService } from '@/api/services'

async function fetchCodeMap(service, listParams, listConfig) {
  const data = await service.list({ page_size: 5000, ...listParams }, listConfig)
  const { results } = unwrapList(data)
  const map = new Map()
  ;(results || []).forEach((row) => {
    const code = String(row.code || '').trim().toLowerCase()
    if (code && row.id) map.set(code, row.id)
  })
  return map
}

async function fetchClassSectionMap(listParams, listConfig) {
  const [csData, classData, sectionData] = await Promise.all([
    academicServices.classSections.list({ page_size: 5000, ...listParams }, listConfig),
    masterServices.classes.list({ page_size: 5000, ...listParams }, listConfig),
    masterServices.sections.list({ page_size: 5000, ...listParams }, listConfig),
  ])

  const classCodeById = new Map()
  unwrapList(classData).results?.forEach((row) => {
    if (row.id) classCodeById.set(row.id, String(row.code || row.name || '').trim().toLowerCase())
  })

  const sectionCodeById = new Map()
  unwrapList(sectionData).results?.forEach((row) => {
    if (row.id) sectionCodeById.set(row.id, String(row.code || row.name || '').trim().toLowerCase())
  })

  const map = new Map()
  unwrapList(csData).results?.forEach((row) => {
    const classCode =
      String(row.class_code || '').trim().toLowerCase() ||
      classCodeById.get(row.class_id) ||
      String(row.class_name || '').trim().toLowerCase()
    const sectionCode =
      String(row.section_code || '').trim().toLowerCase() ||
      sectionCodeById.get(row.section_id) ||
      String(row.section_name || '').trim().toLowerCase()
    if (row.id && classCode && sectionCode) {
      map.set(`${classCode}|${sectionCode}`, row.id)
    }
  })
  return map
}

async function fetchTeacherEmailMap(listParams, listConfig) {
  const data = await userService.list({ page_size: 5000, ...listParams }, listConfig)
  const { results } = unwrapList(data)
  const map = new Map()
  ;(results || []).forEach((row) => {
    const email = String(row.email || '').trim().toLowerCase()
    if (email && row.id) map.set(email, row.id)
  })
  return map
}

function requireCode(map, code, label, rowIndex) {
  const normalized = String(code || '').trim().toLowerCase()
  if (!normalized) {
    throw new Error(`Row ${rowIndex + 2}: ${label} is required.`)
  }
  const id = map.get(normalized)
  if (!id) {
    throw new Error(`Row ${rowIndex + 2}: unknown ${label} "${code}". Create the parent record first.`)
  }
  return id
}

function requireClassSection(map, classCode, sectionCode, rowIndex) {
  const key = `${String(classCode || '').trim().toLowerCase()}|${String(sectionCode || '').trim().toLowerCase()}`
  if (!classCode || !sectionCode) {
    throw new Error(`Row ${rowIndex + 2}: class_code and section_code are required.`)
  }
  const id = map.get(key)
  if (!id) {
    throw new Error(
      `Row ${rowIndex + 2}: no active class section for "${classCode}" / "${sectionCode}". Activate the class section first.`,
    )
  }
  return id
}

function scopeParams(items, { listParams, listRequestConfig }) {
  const schoolId = items[0]?.school_id
  const academicYearId = items[0]?.academic_year_id
  const params = {
    ...listParams,
    page_size: 5000,
    ...(schoolId ? { school: schoolId } : {}),
    ...(academicYearId ? { academic_year: academicYearId } : {}),
  }
  return { params, config: listRequestConfig }
}

export async function resolveAcademicImportItems(entityKey, items, options = {}) {
  const resolver = ACADEMIC_FK_RESOLVERS[entityKey]
  if (!resolver) return items
  return resolver(items, options)
}

const ACADEMIC_FK_RESOLVERS = {
  async curriculums(items, options) {
    const { params, config } = scopeParams(items, options)
    const [classMap, boardMap, streamMap] = await Promise.all([
      fetchCodeMap(masterServices.classes, params, config),
      fetchCodeMap(masterServices.boards, params, config),
      fetchCodeMap(masterServices.streams, params, config),
    ])
    return items.map((item, index) => {
      const { class_code, board_code, stream_code, ...rest } = item
      const resolved = { ...rest, school_class: requireCode(classMap, class_code, 'class_code', index) }
      if (board_code) resolved.board = requireCode(boardMap, board_code, 'board_code', index)
      if (stream_code) resolved.stream = requireCode(streamMap, stream_code, 'stream_code', index)
      return resolved
    })
  },

  async 'curriculum-subjects'(items, options) {
    const { params, config } = scopeParams(items, options)
    const [curriculumMap, subjectMap] = await Promise.all([
      fetchCodeMap(academicServices.curriculums, params, config),
      fetchCodeMap(masterServices.subjects, params, config),
    ])
    return items.map((item, index) => {
      const { curriculum_code, subject_code, ...rest } = item
      return {
        ...rest,
        curriculum: requireCode(curriculumMap, curriculum_code, 'curriculum_code', index),
        subject: requireCode(subjectMap, subject_code, 'subject_code', index),
      }
    })
  },

  async 'elective-subjects'(items, options) {
    const { params, config } = scopeParams(items, options)
    const [curriculumMap, subjectMap, groupMap] = await Promise.all([
      fetchCodeMap(academicServices.curriculums, params, config),
      fetchCodeMap(masterServices.subjects, params, config),
      fetchCodeMap(masterServices.subjectGroups, params, config),
    ])
    return items.map((item, index) => {
      const { curriculum_code, subject_code, subject_group_code, ...rest } = item
      const resolved = {
        ...rest,
        curriculum: requireCode(curriculumMap, curriculum_code, 'curriculum_code', index),
        subject: requireCode(subjectMap, subject_code, 'subject_code', index),
      }
      if (subject_group_code) {
        resolved.subject_group = requireCode(groupMap, subject_group_code, 'subject_group_code', index)
      }
      return resolved
    })
  },

  async 'class-teachers'(items, options) {
    const { params, config } = scopeParams(items, options)
    const [sectionMap, teacherMap] = await Promise.all([
      fetchClassSectionMap(params, config),
      fetchTeacherEmailMap(params, config),
    ])
    return items.map((item, index) => {
      const { class_code, section_code, teacher_email, ...rest } = item
      return {
        ...rest,
        class_section: requireClassSection(sectionMap, class_code, section_code, index),
        teacher: requireCode(teacherMap, teacher_email, 'teacher_email', index),
      }
    })
  },

  async periods(items, options) {
    const { params, config } = scopeParams(items, options)
    const timingMap = await fetchCodeMap(academicServices.classTimings, params, config)
    return items.map((item, index) => {
      const { class_timing_code, ...rest } = item
      return {
        ...rest,
        class_timing: requireCode(timingMap, class_timing_code, 'class_timing_code', index),
      }
    })
  },

  async 'exam-types'(items, options) {
    const { params, config } = scopeParams(items, options)
    const categoryMap = await fetchCodeMap(academicServices.assessmentCategories, params, config)
    return items.map((item, index) => {
      const { category_code, ...rest } = item
      if (!category_code) return rest
      return {
        ...rest,
        category: requireCode(categoryMap, category_code, 'category_code', index),
      }
    })
  },

  async 'class-section-subjects'(items, options) {
    const { params, config } = scopeParams(items, options)
    const [sectionMap, subjectMap, teacherMap] = await Promise.all([
      fetchClassSectionMap(params, config),
      fetchCodeMap(masterServices.subjects, params, config),
      fetchTeacherEmailMap(params, config),
    ])
    return items.map((item, index) => {
      const { class_code, section_code, subject_code, teacher_email, ...rest } = item
      const resolved = {
        ...rest,
        class_section: requireClassSection(sectionMap, class_code, section_code, index),
        subject: requireCode(subjectMap, subject_code, 'subject_code', index),
      }
      if (teacher_email) {
        resolved.teacher = requireCode(teacherMap, teacher_email, 'teacher_email', index)
      }
      return resolved
    })
  },
}
