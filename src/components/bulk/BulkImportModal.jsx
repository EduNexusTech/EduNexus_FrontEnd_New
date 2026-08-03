import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiDownload, FiUpload } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { SelectField } from '@/components/ui/Input'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { useTenant } from '@/contexts/TenantContext'
import { useOrganizationOptions } from '@/hooks/useFormOptions'
import { buildScopedPayload } from '@/utils/scopePayload'
import { getUserOrganizationId, getUserSchoolId } from '@/utils/schoolScope'
import {
  buildSampleCsv,
  mapCsvRowsToItems,
} from '@/utils/csvImport'
import { parseSpreadsheetFile } from '@/utils/spreadsheetImport'
import { downloadBlob } from '@/utils/format'

export default function BulkImportModal({
  open,
  onClose,
  title,
  entityLabel,
  columns,
  exampleRows = [],
  scopeSchool = true,
  scopeOrganization = false,
  scopeAcademicYear = false,
  schoolScope = null,
  academicYearId = '',
  setAcademicYearId,
  yearOptions = [],
  listRequestConfig = null,
  resolveItems,
  importFn,
  queryKey,
  sampleFilename = 'import-sample.csv',
  helpText,
  acceptSpreadsheet = false,
}) {
  const queryClient = useQueryClient()
  const { user, isSuperAdmin } = useAuth()
  const { organizationId: tenantOrgId } = useTenant()
  const orgQuery = useOrganizationOptions(open && scopeOrganization && isSuperAdmin)
  const fileRef = useRef(null)
  const [fileName, setFileName] = useState('')
  const [rowCount, setRowCount] = useState(0)
  const [organizationId, setOrganizationId] = useState('')
  const scopedSchoolId = schoolScope?.schoolId || getUserSchoolId(user)
  const schoolId = scopedSchoolId

  useEffect(() => {
    if (!open) return
    const defaultOrg = tenantOrgId || getUserOrganizationId(user) || ''
    setOrganizationId(defaultOrg ? String(defaultOrg) : '')
  }, [open, tenantOrgId, user])

  const importMut = useMutation({
    mutationFn: importFn,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      const payload = response?.data?.data ?? response?.data ?? response ?? {}
      const count = payload?.count ?? payload?.results?.length
      const errors = payload?.errors?.length ?? 0
      if (typeof count === 'number') {
        toast.success(
          errors
            ? `Imported ${count} row(s)${errors ? ` (${errors} skipped/failed)` : ''}`
            : `Imported ${count} row(s) successfully`,
        )
      } else {
        toast.success('Bulk import completed')
      }
      handleClose()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleClose = () => {
    setFileName('')
    setRowCount(0)
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  const downloadSample = () => {
    const csv = buildSampleCsv(columns, exampleRows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    downloadBlob(blob, sampleFilename)
    toast.success('Sample file downloaded — open in Excel, fill rows, then upload here')
  }

  const fileAccept = acceptSpreadsheet
    ? '.csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
    : '.csv,text/csv'

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    try {
      const parsed = await parseSpreadsheetFile(file)
      setRowCount(parsed.length)
      if (!parsed.length) toast.error('No data rows found in the file')
    } catch (err) {
      setRowCount(0)
      toast.error(err.message || 'Could not read the file')
    }
  }

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) {
      toast.error(acceptSpreadsheet ? 'Choose an Excel or CSV file to import' : 'Choose a CSV file to import')
      return
    }

    const resolvedOrgId =
      organizationId || tenantOrgId || getUserOrganizationId(user) || ''

    if (scopeOrganization && !resolvedOrgId) {
      toast.error('Select an organization before importing')
      return
    }

    if (scopeSchool && !schoolId) {
      toast.error('Select a school before importing')
      return
    }

    if (scopeAcademicYear && !academicYearId) {
      toast.error('Select an academic year before importing')
      return
    }

    try {
      const parsed = await parseSpreadsheetFile(file)
      if (!parsed.length) {
        toast.error('No data rows found in the file')
        return
      }

      let items = mapCsvRowsToItems(parsed, columns)

      const missingRequired = items.find((item, index) => {
        const badCol = columns.find(
          (col) => col.required && (item[col.key] === '' || item[col.key] == null),
        )
        if (badCol) {
          toast.error(`Row ${index + 2}: "${badCol.header}" is required`)
          return true
        }
        return false
      })
      if (missingRequired) return

      if (scopeOrganization && resolvedOrgId) {
        items = items.map((item) => ({
          ...item,
          organization_id: resolvedOrgId,
        }))
      }

      const orgFromScope = schoolScope?.resolvedOrgId || resolvedOrgId

      if (scopeSchool) {
        items = items.map((item) => {
          const scoped = buildScopedPayload(
            { ...item, school_id: item.school_id || schoolId },
            user,
            [],
            { isSuperAdmin },
          )
          return {
            ...scoped,
            school_id: scoped.school_id || schoolId,
            ...(orgFromScope && !scoped.organization_id ? { organization_id: orgFromScope } : {}),
          }
        })
      }

      if (scopeAcademicYear && academicYearId) {
        items = items.map((item) => ({
          ...item,
          academic_year_id: academicYearId,
        }))
      }

      if (resolveItems) {
        items = await resolveItems(items)
      }

      importMut.mutate(items)
    } catch (err) {
      toast.error(err.message || 'Import failed')
    }
  }

  const columnHint = columns
    .map((c) => (c.hint ? `${c.header} (${c.hint})` : c.header))
    .join(', ')

  return (
    <Modal open={open} onClose={handleClose} title={title || 'Bulk Import'} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-muted">
          {acceptSpreadsheet
            ? 'Download the sample file, fill in Excel, then upload the .xlsx or .csv file here.'
            : 'Download the sample file, fill in your data in Excel, save as CSV, then upload.'}
          {helpText ? (
            <span className="mt-1 block text-xs">{helpText}</span>
          ) : scopeSchool && schoolId && !scopeAcademicYear ? (
            <span className="mt-1 block text-xs">
              Records will be saved for your school&apos;s organization (school scope applied automatically).
              Date columns accept DD-MM-YYYY (Excel default) or YYYY-MM-DD.
            </span>
          ) : scopeAcademicYear ? (
            <span className="mt-1 block text-xs">
              Date columns accept DD-MM-YYYY (Excel default) or YYYY-MM-DD.
            </span>
          ) : null}
        </p>

        {schoolScope ? (
          <SchoolScopeField
            schoolId={schoolScope.schoolId}
            setSchoolId={schoolScope.setSchoolId}
            schoolOptions={schoolScope.schoolOptions}
            selectedSchoolLabel={schoolScope.selectedSchoolLabel}
            schoolLocked={schoolScope.schoolLocked}
          />
        ) : null}

        {scopeAcademicYear ? (
          <div>
            <SelectField
              label="Academic Year"
              value={academicYearId}
              onChange={(e) => setAcademicYearId?.(e.target.value)}
              options={yearOptions}
              placeholder="Select academic year…"
              required
            />
            <p className="mt-1 text-xs text-muted">
              All rows will be linked to this academic year.
            </p>
          </div>
        ) : null}

        {scopeOrganization ? (
          <div>
            <SelectField
              label="Organization"
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              options={orgQuery.options}
              placeholder="Select organization…"
              required
            />
            <p className="mt-1 text-xs text-muted">
              Location data is shared by all schools in the selected organization.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button variant="excel" type="button" onClick={downloadSample}>
            <FiDownload className="h-4 w-4" /> Download sample file
          </Button>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-medium text-muted">Columns: {columnHint}</p>
          <label className="flex cursor-pointer flex-col items-center gap-2 py-4">
            <FiUpload className="h-8 w-8 text-primary" />
            <span className="text-sm font-medium">
              {acceptSpreadsheet ? 'Choose Excel (.xlsx) or CSV file' : 'Choose filled CSV file'}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept={fileAccept}
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {fileName ? (
            <p className="text-center text-xs text-muted">
              {fileName}
              {rowCount ? ` — ${rowCount} row${rowCount === 1 ? '' : 's'} ready` : ''}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="cancel" onClick={handleClose}>Cancel</Button>
          <Button variant="upload" loading={importMut.isPending} onClick={handleImport}>
            Import
          </Button>
        </div>
      </div>
    </Modal>
  )
}
