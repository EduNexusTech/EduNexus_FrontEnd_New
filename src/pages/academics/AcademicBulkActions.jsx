import { useEffect, useMemo, useState } from 'react'
import { FiUpload } from 'react-icons/fi'
import { useQuery } from '@tanstack/react-query'
import Button from '@/components/ui/Button'
import BulkImportModal from '@/components/bulk/BulkImportModal'
import { academicYearService } from '@/api/services'
import { unwrapList } from '@/api/client'
import { getAcademicBulkImportConfig } from '@/config/academicBulkImport'
import { resolveAcademicImportItems } from '@/utils/academicBulkResolve'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'

export default function AcademicBulkActions({ entityKey, service, queryKey, label }) {
  const [open, setOpen] = useState(false)
  const schoolScope = useSchoolScopedSelection()
  const bulkConfig = getAcademicBulkImportConfig(entityKey)
  const [academicYearId, setAcademicYearId] = useState('')

  const yearsQuery = useQuery({
    queryKey: ['academic-years-bulk', schoolScope.schoolId],
    enabled: open && Boolean(schoolScope.schoolId),
    queryFn: () =>
      academicYearService.list({
        school: schoolScope.schoolId,
        page_size: 500,
        ordering: '-start_date',
      }),
  })

  const yearOptions = useMemo(() => {
    const { results } = unwrapList(yearsQuery.data)
    return (results || []).map((year) => ({
      label: year.is_current ? `${year.name} (current)` : year.name,
      value: String(year.id),
    }))
  }, [yearsQuery.data])

  useEffect(() => {
    if (!open || !yearOptions.length) return
    const currentValid = academicYearId && yearOptions.some((y) => y.value === academicYearId)
    if (currentValid) return
    const current = yearOptions.find((y) => y.label.includes('(current)'))
    setAcademicYearId(current?.value || yearOptions[0]?.value || '')
  }, [open, yearOptions, academicYearId])

  const resolveItems = useMemo(() => {
    if (!bulkConfig.fkResolve) return undefined
    return (items) =>
      resolveAcademicImportItems(bulkConfig.fkResolve, items, {
        listParams: {
          ...(schoolScope.schoolId ? { school: schoolScope.schoolId } : {}),
          ...(schoolScope.resolvedOrgId ? { organization: schoolScope.resolvedOrgId } : {}),
        },
        listRequestConfig: schoolScope.listRequestConfig,
      })
  }, [bulkConfig.fkResolve, schoolScope.listRequestConfig, schoolScope.resolvedOrgId, schoolScope.schoolId])

  if (!service?.bulkUpload) return null

  const importFn = (items) => service.bulkUpload(items, schoolScope.listRequestConfig)

  return (
    <>
      <Button variant="upload" onClick={() => setOpen(true)}>
        <FiUpload className="h-4 w-4" /> Bulk Import
      </Button>
      <BulkImportModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Bulk Import — ${label || entityKey}`}
        entityLabel={label || entityKey.replace(/-/g, ' ')}
        columns={bulkConfig.columns}
        exampleRows={bulkConfig.exampleRows}
        scopeSchool
        scopeAcademicYear={bulkConfig.scopeYear === true}
        schoolScope={schoolScope}
        academicYearId={academicYearId}
        setAcademicYearId={setAcademicYearId}
        yearOptions={yearOptions}
        resolveItems={resolveItems}
        importFn={importFn}
        queryKey={queryKey}
        sampleFilename={`${entityKey}-import-sample.csv`}
        helpText="Select school and academic year above. CSV rows use codes (class_code, subject_code, etc.) — not UUIDs."
        listRequestConfig={schoolScope.listRequestConfig}
      />
    </>
  )
}
