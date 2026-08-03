import { useMemo, useState } from 'react'
import { FiUpload } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import BulkImportModal from '@/components/bulk/BulkImportModal'
import { useAuth } from '@/contexts/AuthContext'
import { getMasterBulkImportConfig, LOCATION_MASTER_KEYS } from '@/config/masterBulkImport'
import { resolveMasterImportItems } from '@/utils/masterBulkResolve'
import { getUserOrganizationId, getUserSchoolId } from '@/utils/schoolScope'

export default function MasterBulkActions({ masterKey, service, queryKey }) {
  const [open, setOpen] = useState(false)
  const { user, isSuperAdmin } = useAuth()
  const bulkConfig = getMasterBulkImportConfig(masterKey)
  const isLocationMaster = LOCATION_MASTER_KEYS.has(masterKey)

  const listParams = useMemo(() => {
    const orgId = getUserOrganizationId(user)
    return {
      page_size: 5000,
      ...(orgId ? { organization: orgId } : {}),
      ...(!isLocationMaster && getUserSchoolId(user) ? { school: getUserSchoolId(user) } : {}),
    }
  }, [user, isLocationMaster])

  const listRequestConfig = useMemo(() => {
    const orgId = getUserOrganizationId(user)
    return orgId ? { headers: { 'X-Tenant-ID': orgId } } : undefined
  }, [user])

  const resolveItems = useMemo(() => {
    if (!bulkConfig.fkResolve) return undefined
    return (items) => {
      const orgId = items[0]?.organization_id || getUserOrganizationId(user)
      const params = {
        page_size: 5000,
        ...(orgId ? { organization: orgId } : {}),
      }
      const config = orgId ? { headers: { 'X-Tenant-ID': orgId } } : listRequestConfig
      return resolveMasterImportItems(bulkConfig.fkResolve, items, {
        listParams: params,
        listRequestConfig: config,
      })
    }
  }, [bulkConfig.fkResolve, listRequestConfig, user])

  const importWithOrgContext = (items) => {
    const orgId = items[0]?.organization_id
    const config = orgId ? { headers: { 'X-Tenant-ID': orgId } } : undefined
    return service.bulkImport(items, config)
  }

  if (!service.bulkImport) return null

  const canBulkImport = !bulkConfig.superAdminOnly || isSuperAdmin
  if (!canBulkImport) return null

  return (
    <>
      <Button variant="upload" onClick={() => setOpen(true)}>
        <FiUpload className="h-4 w-4" /> Bulk Import
      </Button>
      <BulkImportModal
        open={open}
        onClose={() => setOpen(false)}
        title={`Bulk Import — ${masterKey}`}
        entityLabel={masterKey.replace(/-/g, ' ')}
        columns={bulkConfig.columns}
        exampleRows={bulkConfig.exampleRows}
        scopeSchool={bulkConfig.scopeSchool === true}
        scopeOrganization={bulkConfig.scopeOrganization === true}
        resolveItems={resolveItems}
        importFn={importWithOrgContext}
        queryKey={queryKey}
        sampleFilename={`${masterKey}-import-sample.csv`}
        helpText={
          isLocationMaster
            ? 'Select the organization once above — all rows are saved org-wide (shared by every school). Do not put organization_id or school_id in the CSV.'
            : undefined
        }
      />
    </>
  )
}
