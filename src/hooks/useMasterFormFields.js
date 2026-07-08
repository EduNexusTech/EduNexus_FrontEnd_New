import { useMemo } from 'react'
import { MASTER_DEFINITIONS } from '@/config/masterDefinitions'
import {
  useMasterRecordOptions,
  useOrganizationOptions,
  useSchoolOptions,
} from '@/hooks/useFormOptions'

const FK_FIELD_CONFIG = {
  organization_id: { type: 'organization' },
  country: { type: 'master', serviceKey: 'countries', label: 'Country', dependsOn: 'organization_id' },
  state: { type: 'master', serviceKey: 'states', label: 'State', dependsOn: ['organization_id', 'country'] },
  board: { type: 'master', serviceKey: 'boards', label: 'Board', dependsOn: 'organization_id' },
  school_class: { type: 'master', serviceKey: 'classes', label: 'Class', dependsOn: 'organization_id' },
  department: { type: 'master', serviceKey: 'departments', label: 'Department', dependsOn: 'organization_id' },
  school: { type: 'school', label: 'School', dependsOn: 'organization_id' },
}

export function useMasterFormFields(masterKey) {
  const def = MASTER_DEFINITIONS[masterKey]
  const orgQuery = useOrganizationOptions()
  const countriesQuery = useMasterRecordOptions('countries', null, true)
  const statesQuery = useMasterRecordOptions('states', null, true)
  const boardsQuery = useMasterRecordOptions('boards', null, true)
  const classesQuery = useMasterRecordOptions('classes', null, true)
  const departmentsQuery = useMasterRecordOptions('departments', null, true)
  const allSchoolsQuery = useSchoolOptions(null, true)

  const masterOptionsMap = useMemo(
    () => ({
      countries: countriesQuery.options,
      states: statesQuery.options,
      boards: boardsQuery.options,
      classes: classesQuery.options,
      departments: departmentsQuery.options,
    }),
    [
      countriesQuery.options,
      statesQuery.options,
      boardsQuery.options,
      classesQuery.options,
      departmentsQuery.options,
    ],
  )

  const fields = useMemo(() => {
    if (!def) return []

    return def.fields.map((field) => {
      const config = FK_FIELD_CONFIG[field.name]
      if (!config) return field

      if (config.type === 'organization') {
        return {
          ...field,
          label: 'Organization',
          type: 'select',
          options: orgQuery.options,
          placeholder: 'Select organization',
        }
      }

      if (config.type === 'school') {
        return {
          ...field,
          label: config.label || field.label,
          type: 'select',
          dependsOn: 'organization_id',
          placeholder: 'Select school',
          disabled: (values) => !values?.organization_id,
          getOptions: (values) => {
            if (!values?.organization_id) return []
            return allSchoolsQuery.options.filter(
              (opt) => opt.organizationId === String(values.organization_id),
            )
          },
        }
      }

      if (config.type === 'master') {
        const serviceKey = config.serviceKey
        const parents = Array.isArray(config.dependsOn)
          ? config.dependsOn
          : config.dependsOn
            ? [config.dependsOn]
            : []
        return {
          ...field,
          label: config.label || field.label,
          type: 'select',
          dependsOn: parents.length === 1 ? parents[0] : parents,
          placeholder: `Select ${(config.label || field.label).toLowerCase()}`,
          disabled: parents.length
            ? (values) => parents.some((parent) => !values?.[parent])
            : undefined,
          getOptions: (values) => {
            const orgId = values?.organization_id
            let options = masterOptionsMap[serviceKey] || []
            if (orgId) {
              options = options.filter(
                (opt) => !opt.organizationId || opt.organizationId === String(orgId),
              )
            }
            if (field.name === 'state' && values?.country) {
              options = options.filter(
                (opt) => !opt.countryId || opt.countryId === String(values.country),
              )
            }
            return options
          },
        }
      }

      return field
    })
  }, [def, orgQuery.options, masterOptionsMap, allSchoolsQuery.options])

  const loading =
    orgQuery.isLoading ||
    countriesQuery.isLoading ||
    statesQuery.isLoading ||
    boardsQuery.isLoading ||
    classesQuery.isLoading ||
    departmentsQuery.isLoading ||
    allSchoolsQuery.isLoading

  const error =
    orgQuery.error ||
    countriesQuery.error ||
    statesQuery.error ||
    boardsQuery.error ||
    classesQuery.error ||
    departmentsQuery.error ||
    allSchoolsQuery.error

  return {
    def,
    fields,
    loading,
    error,
    refetch: orgQuery.refetch,
  }
}

export function transformMasterLoad(item) {
  if (!item) return item
  const values = { ...item }
  Object.keys(FK_FIELD_CONFIG).forEach((key) => {
    if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
      values[key] = String(values[key])
    }
  })
  return values
}
