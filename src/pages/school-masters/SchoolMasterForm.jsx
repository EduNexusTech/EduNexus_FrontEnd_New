import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { schoolMasterService } from '@/api/services'
import { SCHOOL_MASTER_DEFINITIONS } from '@/config/schoolMasterDefinitions'
import { unwrapData } from '@/api/client'

export default function SchoolMasterForm() {
  const { masterKey } = useParams()
  const def = SCHOOL_MASTER_DEFINITIONS[masterKey]
  const service = useMemo(() => schoolMasterService.forType(masterKey), [masterKey])

  const parentService = useMemo(
    () => (def?.parentType ? schoolMasterService.forType(def.parentType) : null),
    [def?.parentType],
  )

  const { data: parentData } = useQuery({
    queryKey: ['school-masters', def?.parentType, 'options'],
    queryFn: () => parentService.list({ page_size: 200, is_active: true }),
    enabled: Boolean(parentService),
  })

  const parentOptions = useMemo(() => {
    const rows = unwrapData(parentData)?.results || []
    return rows.map((row) => ({
      label: row.name,
      value: row.entry_id || row.id,
    }))
  }, [parentData])

  const fields = useMemo(() => {
    if (!def) return []
    return def.fields.map((field) => {
      if (field.type === 'parentSelect') {
        return { ...field, type: 'select', options: parentOptions }
      }
      return field
    })
  }, [def, parentOptions])

  if (!def) {
    return <div className="p-8 text-center text-muted">School master type not found</div>
  }

  return (
    <ResourceFormPage
      title={def.label}
      breadcrumb={[
        { label: 'School Masters', href: '/school-masters' },
        { label: def.labelPlural, href: `/school-masters/${masterKey}` },
      ]}
      queryKey={`school-masters-${masterKey}`}
      getFn={service.get}
      createFn={service.create}
      updateFn={service.update}
      basePath={`/school-masters/${masterKey}`}
      fields={fields}
      transformLoad={(item) => ({
        name: item.name || '',
        code: item.code || '',
        description: item.description || '',
        sequence: item.sequence ?? 0,
        is_active: item.is_active ?? true,
        parent: item.parent || '',
      })}
      transformSubmit={(values) => ({
        ...values,
        parent: values.parent || null,
        sequence: Number(values.sequence) || 0,
        is_active: values.is_active !== false && values.is_active !== 'false',
      })}
    />
  )
}
