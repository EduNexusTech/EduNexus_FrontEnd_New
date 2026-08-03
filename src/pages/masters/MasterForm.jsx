import { Navigate, useParams } from 'react-router-dom'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { getErrorMessage } from '@/api/client'
import { useMasterFormFields } from '@/hooks/useMasterFormFields'
import { masterServices } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'

export default function MasterForm() {
  const { masterKey } = useParams()
  const { isSuperAdmin } = useAuth()
  const { def, fields, loading, error, transformLoad } = useMasterFormFields(masterKey)

  if (!def) {
    return <div className="p-8 text-center text-muted">Master type not found</div>
  }

  if (def.superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/masters" replace />
  }

  if (loading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} />

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
      fields={fields}
      transformLoad={transformLoad}
      transformSubmit={(values) => ({
        ...values,
        sequence: values.sequence !== undefined && values.sequence !== '' ? Number(values.sequence) : 0,
        is_active: values.is_active !== false && values.is_active !== 'false',
      })}
    />
  )
}
