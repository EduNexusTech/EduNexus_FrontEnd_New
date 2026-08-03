import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { MASTER_DEFINITIONS } from '@/config/masterDefinitions'
import { masterServices } from '@/api/services'
import MasterBulkActions from '@/pages/masters/MasterBulkActions'
import { useAuth } from '@/contexts/AuthContext'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'

export default function MasterList() {
  const { masterKey } = useParams()
  const { isSuperAdmin } = useAuth()
  const def = MASTER_DEFINITIONS[masterKey]
  const schoolScope = useSchoolScopedSelection()

  if (!def) {
    return <div className="p-8 text-center text-muted">Master type not found</div>
  }

  if (def.superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/masters" replace />
  }

  const service = masterServices[def.serviceKey]
  const readOnly = def.superAdminOnly && !isSuperAdmin

  const listParams = useMemo(() => {
    if (!def.schoolScoped) return {}
    return {
      ...(schoolScope.schoolId ? { school: schoolScope.schoolId } : {}),
      ...(schoolScope.resolvedOrgId ? { organization: schoolScope.resolvedOrgId } : {}),
    }
  }, [def.schoolScoped, schoolScope.schoolId, schoolScope.resolvedOrgId])

  const listFn = useMemo(() => {
    if (!def.schoolScoped) return service.list
    return (params) => service.list(params, schoolScope.listRequestConfig)
  }, [def.schoolScoped, service, schoolScope.listRequestConfig])

  const schoolFilter = def.schoolScoped ? (
    <SchoolScopeField
      schoolId={schoolScope.schoolId}
      setSchoolId={schoolScope.setSchoolId}
      schoolOptions={schoolScope.schoolOptions}
      selectedSchoolLabel={schoolScope.selectedSchoolLabel}
      schoolLocked={schoolScope.schoolLocked}
      className="min-w-[220px]"
    />
  ) : null

  return (
    <ResourceListPage
      title={def.labelPlural}
      subtitle={
        def.superAdminOnly
          ? `Organization-wide ${def.labelPlural.toLowerCase()} — shared by all schools`
          : def.schoolScoped
            ? `School-specific ${def.labelPlural.toLowerCase()} — each school maintains its own list`
            : `Organization master data — ${def.labelPlural.toLowerCase()}`
      }
      breadcrumb={[
        { label: 'Masters', href: '/masters' },
        { label: def.labelPlural },
      ]}
      queryKey={`masters-${masterKey}`}
      listFn={listFn}
      deleteFn={readOnly ? undefined : service.delete}
      basePath={`/masters/${masterKey}`}
      columns={def.columns}
      readOnly={readOnly}
      listParams={listParams}
      filters={schoolFilter}
      extraActions={
        <MasterBulkActions masterKey={masterKey} service={service} queryKey={`masters-${masterKey}`} />
      }
    />
  )
}
