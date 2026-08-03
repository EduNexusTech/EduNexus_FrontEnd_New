import { useMemo, useState } from 'react'
import { FiUpload } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import BulkImportModal from '@/components/bulk/BulkImportModal'
import { getFeeBulkImportConfig } from '@/config/feeBulkImport'
import { getFeeMasterService } from '@/config/feeMasterServices'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'

export default function FeeBulkActions({ entityKey, queryKey, label }) {
  const [open, setOpen] = useState(false)
  const schoolScope = useSchoolScopedSelection()
  const service = getFeeMasterService(entityKey)
  const bulkConfig = getFeeBulkImportConfig(entityKey)

  const importFn = useMemo(() => {
    if (!service?.bulkUpload) return undefined
    return (items) =>
      service.bulkUpload(items, {
        params: { school: schoolScope.schoolId },
        ...schoolScope.listRequestConfig,
      })
  }, [schoolScope.listRequestConfig, schoolScope.schoolId, service])

  if (!service?.bulkUpload) return null

  return (
    <>
      <Button variant="upload" onClick={() => setOpen(true)}>
        <FiUpload className="h-4 w-4" /> Bulk Import
      </Button>
      <BulkImportModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Bulk Import — ${label}`}
        entityLabel={label?.toLowerCase() || entityKey}
        columns={bulkConfig.columns}
        exampleRows={bulkConfig.exampleRows}
        scopeSchool
        schoolScope={schoolScope}
        importFn={importFn}
        queryKey={queryKey}
        sampleFilename={`fee-${entityKey}-sample.csv`}
        helpText="School scope is applied automatically. Use codes in lowercase."
      />
    </>
  )
}
