import { useParams } from 'react-router-dom'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { MASTER_DEFINITIONS } from '@/config/masterDefinitions'
import { masterServices } from '@/api/services'

export default function MasterForm() {
  const { masterKey } = useParams()
  const def = MASTER_DEFINITIONS[masterKey]

  if (!def) {
    return <div className="p-8 text-center text-muted">Master type not found</div>
  }

  const service = masterServices[def.serviceKey]

  return (
    <ResourceFormPage
      title={def.label}
      breadcrumb={[
        { label: 'Masters', href: '/masters' },
        { label: def.labelPlural, href: `/masters/${masterKey}` },
      ]}
      queryKey={`masters-${masterKey}`}
      getFn={service.get}
      createFn={service.create}
      updateFn={service.update}
      basePath={`/masters/${masterKey}`}
      fields={def.fields}
      transformSubmit={(values) => ({
        ...values,
        sequence: values.sequence !== undefined && values.sequence !== '' ? Number(values.sequence) : 0,
        is_active: values.is_active !== false && values.is_active !== 'false',
      })}
    />
  )
}
