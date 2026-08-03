import { unwrapList } from '@/api/client'
import { studentService } from '@/api/services'

export function filterStudentsByAdmissionAndName(students, { admissionNo = '', studentName = '' } = {}) {
  const adm = admissionNo.trim().toLowerCase()
  const name = studentName.trim().toLowerCase()

  return (students || []).filter((student) => {
    if (adm && !String(student.admission_number || '').toLowerCase().includes(adm)) {
      return false
    }
    if (name && !String(student.full_name || '').toLowerCase().includes(name)) {
      return false
    }
    return true
  })
}

export async function searchStudentsByAdmissionAndName(
  { schoolId, academicYearId, admissionNo = '', studentName = '' },
  listConfig,
) {
  const adm = admissionNo.trim()
  const name = studentName.trim()

  if (!adm && !name) {
    throw new Error('Enter admission number or student name to search.')
  }

  const params = {
    school: schoolId,
    page_size: 50,
    ...(academicYearId ? { academic_year: academicYearId } : {}),
    q: name || adm,
  }

  const data = await studentService.search(params, listConfig)
  const { results } = unwrapList(data)
  const matches = filterStudentsByAdmissionAndName(results, { admissionNo: adm, studentName: name })

  if (!matches.length) {
    const hint = [adm && `admission "${adm}"`, name && `name "${name}"`].filter(Boolean).join(' and ')
    throw new Error(`No student found matching ${hint}.`)
  }

  return matches
}

export function resolveStudentId(student) {
  return student?.student_id || student?.id || ''
}

export function buildStudentLookupKey(studentId, yearId = '') {
  if (!yearId) return studentId
  return `${studentId}|${yearId}`
}

export function parseStudentLookupKey(lookupKey) {
  if (!lookupKey) return null
  const sep = lookupKey.indexOf('|')
  if (sep < 0) {
    return { studentId: lookupKey, yearId: '' }
  }
  if (sep === 0) return null
  return {
    studentId: lookupKey.slice(0, sep),
    yearId: lookupKey.slice(sep + 1),
  }
}
