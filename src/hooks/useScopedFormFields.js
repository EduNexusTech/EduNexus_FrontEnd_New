import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  academicServices,
  academicYearService,
  roleService,
  userService,
} from '@/api/services'
import { unwrapList } from '@/api/client'
import {
  FK_DISPLAY_LABELS,
  FK_FIELD_NAMES,
  sortScopedFormFields,
  transformScopedLoad,
} from '@/config/formFieldConfig'
import {
  useMasterRecordOptions,
  useOrganizationOptions,
  useSchoolOptions,
} from '@/hooks/useFormOptions'
import { useAuth } from '@/contexts/AuthContext'
import { getUserOrganizationId, isSchoolAdminUser } from '@/utils/schoolScope'

function resolveFkField(field, optionsMap) {
  const name = field.name
  const label = FK_DISPLAY_LABELS[name] || field.label

  if (name === 'organization_id' || name === 'organization') {
    return {
      ...field,
      label,
      type: 'select',
      options: optionsMap.organizations,
      placeholder: 'Select organization',
    }
  }

  if (name === 'school_id' || name === 'school') {
    return {
      ...field,
      label,
      type: 'select',
      dependsOn: name === 'school_id' ? 'organization_id' : 'organization',
      placeholder: 'Select school',
      disabled: (values) => {
        const orgKey = values?.organization_id ? 'organization_id' : 'organization'
        return !values?.[orgKey] && !optionsMap.schools?.length
      },
      getOptions: (values) => {
        const orgId = values?.organization_id || values?.organization
        let opts = optionsMap.schools || []
        if (orgId) {
          opts = opts.filter((o) => !o.organizationId || o.organizationId === String(orgId))
        }
        return opts
      },
    }
  }

  if (name === 'academic_year_id' || name === 'academic_year') {
    return {
      ...field,
      label,
      type: 'select',
      dependsOn: 'school_id',
      placeholder: 'Select academic year',
      disabled: (values) => !values?.school_id && !values?.school,
      getOptions: (values) => {
        const schoolId = values?.school_id || values?.school
        if (!schoolId) return []
        return (optionsMap.academicYears || []).filter(
          (y) => !y.schoolId || y.schoolId === String(schoolId),
        )
      },
    }
  }

  if (name === 'country') {
    return masterSelect(field, label, 'countries', optionsMap, 'organization_id')
  }
  if (name === 'state') {
    return {
      ...masterSelect(field, label, 'states', optionsMap, 'organization_id'),
      getOptions: (values) => {
        let opts = filterByOrg(optionsMap.states, values)
        if (values?.country) {
          opts = opts.filter((o) => !o.countryId || o.countryId === String(values.country))
        }
        return opts
      },
    }
  }
  if (name === 'city') {
    return {
      ...masterSelect(field, label, 'cities', optionsMap, 'organization_id'),
      getOptions: (values) => {
        let opts = filterByOrg(optionsMap.cities, values)
        if (values?.state) {
          opts = opts.filter((o) => !o.stateId || o.stateId === String(values.state))
        }
        return opts
      },
    }
  }
  if (name === 'board') {
    return masterSelect(field, label, 'boards', optionsMap, 'organization_id')
  }
  if (name === 'school_class') {
    return schoolScopedMasterSelect(field, label, 'classes', optionsMap)
  }
  if (name === 'section') {
    return schoolScopedMasterSelect(field, label, 'sections', optionsMap)
  }
  if (name === 'stream') {
    return schoolScopedMasterSelect(field, label, 'streams', optionsMap)
  }
  if (name === 'subject') {
    return schoolScopedMasterSelect(field, label, 'subjects', optionsMap)
  }
  if (name === 'subject_group') {
    return schoolScopedMasterSelect(field, label, 'subjectGroups', optionsMap)
  }
  if (name === 'department') {
    return schoolScopedMasterSelect(field, label, 'departments', optionsMap)
  }
  if (name === 'designation') {
    return schoolScopedMasterSelect(field, label, 'designations', optionsMap)
  }
  if (name === 'curriculum') {
    return academicSelect(field, label, 'curriculums', optionsMap)
  }
  if (name === 'class_timing') {
    return academicSelect(field, label, 'classTimings', optionsMap)
  }
  if (name === 'class_section') {
    return {
      ...field,
      label,
      type: 'select',
      dependsOn: ['school_id', 'academic_year_id'],
      placeholder: 'Select class section',
      disabled: (values) => !values?.school_id || !values?.academic_year_id,
      getOptions: (values) => {
        const schoolId = values?.school_id
        const yearId = values?.academic_year_id
        if (!schoolId || !yearId) return []
        return (optionsMap.classSections || []).filter((row) => {
          if (row.schoolId && row.schoolId !== String(schoolId)) return false
          if (row.academicYearId && row.academicYearId !== String(yearId)) return false
          return true
        })
      },
    }
  }
  if (name === 'teacher' || name === 'user') {
    return {
      ...field,
      label: name === 'teacher' ? 'Teacher' : label,
      type: 'select',
      dependsOn: name === 'user' ? 'organization' : 'organization_id',
      placeholder: name === 'teacher' ? 'Select teacher' : 'Select user',
      getOptions: (values) => {
        const orgId = values?.organization_id || values?.organization
        let opts = optionsMap.users || []
        if (orgId) {
          opts = opts.filter((o) => !o.organizationId || o.organizationId === String(orgId))
        }
        return opts
      },
    }
  }
  if (name === 'role') {
    return {
      ...field,
      label,
      type: 'select',
      dependsOn: 'organization',
      placeholder: 'Select role',
      getOptions: (values) => {
        const orgId = values?.organization
        let opts = optionsMap.roles || []
        if (orgId) {
          opts = opts.filter((o) => !o.organizationId || o.organizationId === String(orgId))
        }
        return opts
      },
    }
  }

  return field
}

function filterByOrg(options, values) {
  const orgId = values?.organization_id || values?.organization
  let opts = options || []
  if (orgId) {
    opts = opts.filter((o) => !o.organizationId || o.organizationId === String(orgId))
  }
  return opts
}

function schoolScopedMasterSelect(field, label, key, optionsMap) {
  return {
    ...field,
    label,
    type: 'select',
    dependsOn: ['organization_id', 'school_id'],
    placeholder: `Select ${label.toLowerCase()}`,
    disabled: (values) => !(values?.school_id || values?.school),
    getOptions: (values) => {
      const schoolId = values?.school_id || values?.school
      if (!schoolId) return []
      let opts = filterByOrg(optionsMap[key], values)
      return opts.filter((o) => !o.schoolId || o.schoolId === String(schoolId))
    },
  }
}

function masterSelect(field, label, key, optionsMap, dependsOn) {
  return {
    ...field,
    label,
    type: 'select',
    dependsOn,
    placeholder: `Select ${label.toLowerCase()}`,
    disabled: dependsOn ? (values) => !values?.[dependsOn] : undefined,
    getOptions: (values) => filterByOrg(optionsMap[key], values),
  }
}

function academicSelect(field, label, key, optionsMap) {
  return {
    ...field,
    label,
    type: 'select',
    dependsOn: 'school_id',
    placeholder: `Select ${label.toLowerCase()}`,
    disabled: (values) => !values?.school_id,
    getOptions: (values) => {
      const schoolId = values?.school_id
      if (!schoolId) return []
      return (optionsMap[key] || []).filter(
        (o) => !o.schoolId || o.schoolId === String(schoolId),
      )
    },
  }
}

export function useScopedFormFields(def) {
  const { user, isSuperAdmin } = useAuth()
  const userOrgId = getUserOrganizationId(user)
  const orgLocked = !isSuperAdmin && Boolean(userOrgId)
  const orgQuery = useOrganizationOptions()
  const schoolsQuery = useSchoolOptions(null, true)
  const countriesQuery = useMasterRecordOptions('countries', null, true)
  const statesQuery = useMasterRecordOptions('states', null, true)
  const citiesQuery = useMasterRecordOptions('cities', null, true)
  const boardsQuery = useMasterRecordOptions('boards', null, true)
  const classesQuery = useMasterRecordOptions('classes', null, true)
  const sectionsQuery = useMasterRecordOptions('sections', null, true)
  const streamsQuery = useMasterRecordOptions('streams', null, true)
  const subjectsQuery = useMasterRecordOptions('subjects', null, true)
  const subjectGroupsQuery = useMasterRecordOptions('subjectGroups', null, true)
  const departmentsQuery = useMasterRecordOptions('departments', null, true)
  const designationsQuery = useMasterRecordOptions('designations', null, true)

  const yearsQuery = useQuery({
    queryKey: ['academic-years', 'form-options'],
    queryFn: () => academicYearService.list({ page_size: 500, ordering: '-start_date' }),
    staleTime: 5 * 60 * 1000,
  })

  const curriculumsQuery = useQuery({
    queryKey: ['curriculums', 'form-options'],
    queryFn: () => academicServices.curriculums.list({ page_size: 500 }),
    staleTime: 5 * 60 * 1000,
  })

  const classTimingsQuery = useQuery({
    queryKey: ['class-timings', 'form-options'],
    queryFn: () => academicServices.classTimings.list({ page_size: 500 }),
    staleTime: 5 * 60 * 1000,
  })

  const classSectionsQuery = useQuery({
    queryKey: ['class-sections', 'form-options'],
    queryFn: () => academicServices.classSections.list({ page_size: 500 }),
    staleTime: 5 * 60 * 1000,
  })

  const usersQuery = useQuery({
    queryKey: ['users', 'scoped-form-options'],
    queryFn: () => userService.list({ page_size: 500, ordering: 'first_name' }),
    staleTime: 5 * 60 * 1000,
  })

  const rolesQuery = useQuery({
    queryKey: ['roles', 'scoped-form-options'],
    queryFn: () => roleService.list({ page_size: 500 }),
    enabled: Boolean(def?.fields?.some((f) => f.name === 'role')),
    staleTime: 5 * 60 * 1000,
  })

  const optionsMap = useMemo(() => {
    const yearResults = unwrapList(yearsQuery.data).results || []
    const curriculumResults = unwrapList(curriculumsQuery.data).results || []
    const timingResults = unwrapList(classTimingsQuery.data).results || []
    const sectionResults = unwrapList(classSectionsQuery.data).results || []
    const userResults = unwrapList(usersQuery.data).results || []
    const roleResults = unwrapList(rolesQuery.data).results || []

    return {
      organizations: orgQuery.options,
      schools: schoolsQuery.options,
      countries: countriesQuery.options,
      states: statesQuery.options,
      cities: citiesQuery.options,
      boards: boardsQuery.options,
      classes: classesQuery.options,
      sections: sectionsQuery.options,
      streams: streamsQuery.options,
      subjects: subjectsQuery.options,
      subjectGroups: subjectGroupsQuery.options,
      departments: departmentsQuery.options,
      designations: designationsQuery.options,
      academicYears: yearResults.map((y) => ({
        value: String(y.id),
        label: y.name,
        schoolId: y.school ? String(y.school) : y.school_id ? String(y.school_id) : '',
      })),
      curriculums: curriculumResults.map((c) => ({
        value: String(c.id),
        label: c.name,
        schoolId: c.school_id ? String(c.school_id) : '',
      })),
      classTimings: timingResults.map((t) => ({
        value: String(t.id),
        label: t.name,
        schoolId: t.school_id ? String(t.school_id) : '',
      })),
      classSections: sectionResults.map((cs) => ({
        value: String(cs.id),
        label:
          cs.class_section_label ||
          [cs.class_name, cs.section_name].filter(Boolean).join(' — ') ||
          cs.name ||
          'Class section',
        schoolId: cs.school_id ? String(cs.school_id) : '',
        academicYearId: cs.academic_year_id
          ? String(cs.academic_year_id)
          : cs.academic_year
            ? String(cs.academic_year)
            : '',
      })),
      users: userResults.map((u) => ({
        value: String(u.user_id || u.id),
        label:
          u.full_name ||
          `${u.first_name || ''} ${u.last_name || ''}`.trim() ||
          u.email ||
          'User',
        organizationId: u.organization_id ? String(u.organization_id) : '',
      })),
      roles: roleResults.map((r) => ({
        value: String(r.role_id || r.id),
        label: `${r.role_name} (${r.role_code})`,
        organizationId: r.organization_id ? String(r.organization_id) : '',
      })),
    }
  }, [
    orgQuery.options,
    schoolsQuery.options,
    countriesQuery.options,
    statesQuery.options,
    citiesQuery.options,
    boardsQuery.options,
    classesQuery.options,
    sectionsQuery.options,
    streamsQuery.options,
    subjectsQuery.options,
    subjectGroupsQuery.options,
    departmentsQuery.options,
    designationsQuery.options,
    yearsQuery.data,
    curriculumsQuery.data,
    classTimingsQuery.data,
    classSectionsQuery.data,
    usersQuery.data,
    rolesQuery.data,
  ])

  const fields = useMemo(() => {
    if (!def?.fields) return []
    const resolved = def.fields.map((field) => {
      if (!FK_FIELD_NAMES.has(field.name)) return field
      let next = resolveFkField(field, optionsMap)

      if (
        orgLocked &&
        (field.name === 'organization_id' || field.name === 'organization')
      ) {
        const orgLabel =
          user?.organization_name ||
          orgQuery.options.find((o) => o.value === userOrgId)?.label ||
          'Organization'
        next = {
          ...next,
          type: 'select',
          required: false,
          disabled: () => true,
          options: [{ value: userOrgId, label: orgLabel }],
        }
      }

      if (
        isSchoolAdminUser(user) &&
        (field.name === 'school_id' || field.name === 'school') &&
        next.type === 'select'
      ) {
        const schoolLabel =
          user?.school_name ||
          optionsMap.schools?.find((s) => s.value === String(user.school_id || ''))?.label ||
          'School'
        const schoolId = String(user.school_id || user.school || '')
        if (schoolId) {
          next = {
            ...next,
            required: false,
            disabled: () => true,
            options: [{ value: schoolId, label: schoolLabel }],
          }
        }
      }

      return next
    })
    return sortScopedFormFields(resolved)
  }, [def?.fields, optionsMap, orgLocked, userOrgId, user, orgQuery.options, isSuperAdmin])

  const loading =
    orgQuery.isLoading ||
    schoolsQuery.isLoading ||
    countriesQuery.isLoading ||
    statesQuery.isLoading ||
    citiesQuery.isLoading ||
    boardsQuery.isLoading ||
    classesQuery.isLoading ||
    sectionsQuery.isLoading ||
    streamsQuery.isLoading ||
    subjectsQuery.isLoading ||
    subjectGroupsQuery.isLoading ||
    departmentsQuery.isLoading ||
    designationsQuery.isLoading ||
    yearsQuery.isLoading ||
    curriculumsQuery.isLoading ||
    classTimingsQuery.isLoading ||
    classSectionsQuery.isLoading ||
    usersQuery.isLoading

  const error = orgQuery.error || schoolsQuery.error || countriesQuery.error

  return {
    def,
    fields,
    loading,
    error,
    transformLoad: transformScopedLoad,
    refetch: orgQuery.refetch,
  }
}
