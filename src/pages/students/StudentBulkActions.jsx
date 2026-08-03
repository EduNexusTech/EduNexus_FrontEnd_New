import { useMemo, useState } from 'react'
import { FiUpload } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import BulkImportModal from '@/components/bulk/BulkImportModal'
import { listActiveClassSections } from '@/api/activeClassSections'
import { academicYearService, studentService } from '@/api/services'
import { unwrapList } from '@/api/client'
import {
  STUDENT_BULK_IMPORT_COLUMNS,
  STUDENT_BULK_IMPORT_EXAMPLE_ROWS,
} from '@/config/studentBulkImport'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import {
  buildClassSectionImportMap,
  formatClassSectionImportHint,
  resolveClassSectionImportId,
} from '@/utils/classSections'

async function validateStudentImportItems(items) {
  items.forEach((item, index) => {
    if (!item.email && !item.mobile_number) {
      throw new Error(`Row ${index + 2}: Mobile or Email is required`)
    }
  })
  return items
}

async function loadActiveClassSectionsForImport(schoolId) {
  const yearsRes = await academicYearService.list({
    school: schoolId,
    page_size: 100,
    ordering: '-start_date',
  })
  const { results: years } = unwrapList(yearsRes)
  const currentYear = years.find((year) => year.is_current) || years[0]

  const { results } = await listActiveClassSections({
    schoolId,
    academicYearId: currentYear?.id,
    pageSize: 500,
  })

  return results || []
}

export default function StudentBulkActions() {
  const [open, setOpen] = useState(false)
  const schoolScope = useSchoolScopedSelection()

  const resolveItems = useMemo(
    () => async (items) => {
      const validated = await validateStudentImportItems(items)
      const sections = await loadActiveClassSectionsForImport(schoolScope.schoolId)
      const byClassSection = buildClassSectionImportMap(sections)
      const availableHint = formatClassSectionImportHint(sections)

      return validated.map((item, index) => {
        const classInput = item.class_name || item.class || ''
        const sectionInput = item.section_name || item.section || ''
        const next = { ...item }
        delete next.class_name
        delete next.section_name
        delete next.class
        delete next.section

        const className = String(classInput).trim()
        const sectionName = String(sectionInput).trim()

        if (!className && !sectionName) return next
        if (!className || !sectionName) {
          throw new Error(`Row ${index + 2}: provide both Class and Section, or leave both blank`)
        }

        const classSectionId = resolveClassSectionImportId(byClassSection, className, sectionName)
        if (!classSectionId) {
          throw new Error(
            `Row ${index + 2}: class "${className}" / section "${sectionName}" not found in active classes for the current academic year. Available: ${availableHint}`,
          )
        }
        return { ...next, class_section: classSectionId }
      })
    },
    [schoolScope.schoolId],
  )

  const importFn = useMemo(
    () => (items) =>
      studentService.bulkImport(items, {
        params: { school: schoolScope.schoolId },
        ...schoolScope.listRequestConfig,
      }),
    [schoolScope.listRequestConfig, schoolScope.schoolId],
  )

  return (
    <>
      <Button variant="upload" onClick={() => setOpen(true)}>
        <FiUpload className="h-4 w-4" /> Bulk Import
      </Button>
      <BulkImportModal
        open={open}
        onClose={() => setOpen(false)}
        title="Bulk Import Students"
        entityLabel="student"
        columns={STUDENT_BULK_IMPORT_COLUMNS}
        exampleRows={STUDENT_BULK_IMPORT_EXAMPLE_ROWS}
        scopeSchool
        schoolScope={schoolScope}
        resolveItems={resolveItems}
        importFn={importFn}
        queryKey="students"
        sampleFilename="students-import-sample.csv"
        acceptSpreadsheet
        helpText="Upload Excel (.xlsx) or CSV. Class/Section accepts labels like Grade 1, Class 1, or 1 with section A (must match active classes for the current academic year). Parents are created and linked automatically when parent columns are filled."
      />
    </>
  )
}
