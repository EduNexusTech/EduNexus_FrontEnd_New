import { useParams } from 'react-router-dom'
import ResourceListPage from '@/components/crud/ResourceListPage'
import { MASTER_DEFINITIONS } from '@/config/masterDefinitions'
import { masterServices } from '@/api/services'
import MasterBulkActions from '@/pages/masters/MasterBulkActions'

export default function MasterList() {
  const { masterKey } = useParams()
  const def = MASTER_DEFINITIONS[masterKey]

  if (!def) {
    return <div className="p-8 text-center text-muted">Master type not found</div>
  }

  const service = masterServices[def.serviceKey]

  return (
    <ResourceListPage
      title={def.labelPlural}
      subtitle={`Organization master data — ${def.labelPlural.toLowerCase()}`}
      breadcrumb={[
        { label: 'Masters', href: '/masters' },
        { label: def.labelPlural },
      ]}
      queryKey={`masters-${masterKey}`}
      listFn={service.list}
      deleteFn={service.delete}
      basePath={`/masters/${masterKey}`}
      columns={def.columns}
      extraActions={
        <MasterBulkActions masterKey={masterKey} service={service} queryKey={`masters-${masterKey}`} />
      }
    />
  )
}
