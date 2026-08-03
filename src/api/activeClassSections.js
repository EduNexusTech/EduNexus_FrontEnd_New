import { academicServices } from '@/api/services'
import { unwrapList } from '@/api/client'
import { CLASS_SECTION_ORDERING, sortClassSections } from '@/utils/classSections'

/**
 * List class sections that are activated for academic forms / workflows.
 * Masters Map creates inactive rows; Academics → Active Classes turns them on.
 */
export async function listActiveClassSections({ schoolId, academicYearId, pageSize = 200 } = {}) {
  const response = await academicServices.classSections.list({
    page_size: pageSize,
    is_active: true,
    status: 'active',
    ordering: CLASS_SECTION_ORDERING,
    ...(schoolId ? { school: schoolId } : {}),
    ...(academicYearId ? { academic_year: academicYearId } : {}),
  })
  const list = unwrapList(response)
  return {
    ...list,
    results: sortClassSections(list.results),
  }
}
