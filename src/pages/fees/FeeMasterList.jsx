import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { getFeeMasterDefinition } from '@/config/feeDefinitions'
import { getFeeMasterService } from '@/config/feeMasterServices'
import { buildScopedPayload } from '@/utils/scopePayload'
import { useAuth } from '@/contexts/AuthContext'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import FeeBulkActions from '@/pages/fees/FeeBulkActions'

function useFeeMasterApi(entityKey) {
  const schoolScope = useSchoolScopedSelection()
  const { user, isSuperAdmin } = useAuth()
  const service = getFeeMasterService(entityKey)

  const listParams = useMemo(
    () => ({
      page_size: 50,
      is_active: 'all',
      ...(schoolScope.schoolId ? { school: schoolScope.schoolId } : {}),
    }),
    [schoolScope.schoolId],
  )

  const requestConfig = useMemo(
    () => ({
      params: { school: schoolScope.schoolId },
      ...schoolScope.listRequestConfig,
    }),
    [schoolScope.listRequestConfig, schoolScope.schoolId],
  )

  const api = useMemo(() => {
    if (!service) return null
    return {
      list: (params) => service.list({ ...listParams, ...params }, requestConfig),
      get: (id) => service.get(id, requestConfig),
      create: (data) =>
        service.create(
          buildScopedPayload({ ...data, school_id: schoolScope.schoolId }, user, [], { isSuperAdmin }),
          requestConfig,
        ),
      update: (id, data) => service.update(id, data, requestConfig),
      delete: (id) => service.delete(id, requestConfig),
    }
  }, [isSuperAdmin, listParams, requestConfig, schoolScope.schoolId, service, user])

  return { api, schoolScope, listParams }
}

export function FeeMasterList() {
  const { entityKey } = useParams()
  const def = getFeeMasterDefinition(entityKey)
  const { api, schoolScope, listParams } = useFeeMasterApi(entityKey)
  const queryKey = `fees-master-${entityKey}`

  if (!def || !api) {
    return <div className="p-8 text-center text-muted">Fee master not found</div>
  }

  const schoolFilter = (
    <SchoolScopeField
      schoolId={schoolScope.schoolId}
      setSchoolId={schoolScope.setSchoolId}
      schoolOptions={schoolScope.schoolOptions}
      selectedSchoolLabel={schoolScope.selectedSchoolLabel}
      schoolLocked={schoolScope.schoolLocked}
      className="min-w-[220px]"
    />
  )

  return (
    <ResourceListPage
      title={def.labelPlural}
      subtitle="Define fee types and default amounts for your school"
      breadcrumb={[
        { label: 'Fee Management', href: '/fees' },
        { label: 'Step 1 — Fee Codes' },
      ]}
      queryKey={queryKey}
      listFn={api.list}
      listParams={listParams}
      deleteFn={api.delete}
      basePath={`/fees/masters/${entityKey}`}
      columns={def.columns}
      filters={schoolFilter}
      extraActions={
        <FeeBulkActions entityKey={entityKey} queryKey={queryKey} label={def.labelPlural} />
      }
    />
  )
}

export function FeeMasterForm() {
  const { entityKey } = useParams()
  const def = getFeeMasterDefinition(entityKey)
  const { api } = useFeeMasterApi(entityKey)

  if (!def || !api) {
    return <div className="p-8 text-center text-muted">Fee master not found</div>
  }

  return (
    <ResourceFormPage
      title={def.label}
      breadcrumb={[
        { label: 'Fee Management', href: '/fees' },
        { label: def.labelPlural, href: `/fees/masters/${entityKey}` },
      ]}
      queryKey={`fees-master-${entityKey}`}
      getFn={api.get}
      createFn={api.create}
      updateFn={api.update}
      basePath={`/fees/masters/${entityKey}`}
      fields={def.fields}
    />
  )
}

export function FeeModulePlaceholder() {
  const { moduleKey } = useParams()
  return (
    <div className="mx-auto max-w-lg p-12 text-center">
      <h1 className="text-xl font-bold capitalize">{moduleKey?.replace(/-/g, ' ')}</h1>
      <p className="mt-2 text-muted">This section is not part of the simplified fee workflow.</p>
      <a href="/fees" className="mt-4 inline-block text-primary underline">Back to Fee Management</a>
    </div>
  )
}
