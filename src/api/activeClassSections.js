import { academicServices } from '@/api/services'
import { unwrapList } from '@/api/client'

/**
 * List class sections that are activated for academic forms / workflows.
 * Masters Map creates inactive rows; Academics → Active Classes turns them on.
 */
export async function listActiveClassSections({ schoolId, academicYearId, pageSize = 200 } = {}) {
  const response = await academicServices.classSections.list({
    page_size: pageSize,
    is_active: true,
    status: 'active',
    ...(schoolId ? { school: schoolId } : {}),
    ...(academicYearId ? { academic_year: academicYearId } : {}),
  })
  return unwrapList(response)
}
