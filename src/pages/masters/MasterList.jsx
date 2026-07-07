import { useParams } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import { MASTER_DEFINITIONS } from '@/config/masterDefinitions'
import { masterServices } from '@/api/services'
import { resolveRecordId } from '@/utils/record'
import { formatDateTime } from '@/utils/format'

export function MasterList() {
  const { masterKey } = useParams()
  const def = MASTER_DEFINITIONS[masterKey]
  const { viewId, isOpen, openView, closeView } = useListDetailModal()

  if (!def) return <div className="p-8 text-center text-muted">Master type not found</div>

  const service = masterServices[def.serviceKey]

  const detailFields = [
    ...def.fields
      .filter((f) => f.type !== 'checkbox')
      .map((f) => ({ key: f.name, label: f.label, fullWidth: f.fullWidth })),
    ...def.fields
      .filter((f) => f.type === 'checkbox')
      .map((f) => ({
        key: f.name,
        label: f.label,
        render: (item) => (item[f.name] ? 'Yes' : 'No'),
      })),
    { key: 'created_at', label: 'Created', render: (item) => formatDateTime(item.created_at) },
  ]

  return (
    <>
      <ResourceListPage
        title={def.labelPlural}
        subtitle={`Manage ${def.labelPlural.toLowerCase()}`}
        breadcrumb={[{ label: 'Masters', href: '/masters' }, { label: def.labelPlural }]}
        queryKey={`masters-${masterKey}`}
        listFn={service.list}
        deleteFn={service.delete}
        basePath={`/masters/${masterKey}`}
        columns={def.columns}
        onView={(item) => openView(item, resolveRecordId(item))}
      />

      <ResourceDetailModal
        recordId={viewId}
        open={isOpen}
        onClose={closeView}
        queryKey={`masters-${masterKey}`}
        getFn={service.get}
        getTitle={(item) => item.name || item.title || def.label}
        fields={detailFields}
        editPath={(_item, id) => `/masters/${masterKey}/${id}/edit`}
      />
    </>
  )
}

export function MasterForm() {
  const { masterKey } = useParams()
  const def = MASTER_DEFINITIONS[masterKey]

  if (!def) return <div className="p-8 text-center text-muted">Master type not found</div>

  const service = masterServices[def.serviceKey]

  return (
    <ResourceFormPage
      title={def.label}
      breadcrumb={[{ label: 'Masters', href: '/masters' }, { label: def.labelPlural, href: `/masters/${masterKey}` }]}
      queryKey={`masters-${masterKey}`}
      getFn={service.get}
      createFn={service.create}
      updateFn={service.update}
      basePath={`/masters/${masterKey}`}
      fields={def.fields}
    />
  )
}

export default MasterList
