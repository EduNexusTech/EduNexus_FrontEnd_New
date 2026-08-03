import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiArrowRight, FiPlus, FiTrash2 } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Feedback'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { useSchoolSetup } from '@/hooks/useSchoolScopedSelection'
import { cn } from '@/lib/utils'
import { getErrorMessage, unwrapList } from '@/api/client'
import { resolveRecordId } from '@/utils/record'
import { academicServices, masterServices } from '@/api/services'
import SetupExistingItemsPanel from '@/pages/masters/SetupExistingItemsPanel'
import {
  emptySectionRow,
  emptyStdRow,
  pairKey,
  SECTION_PRESETS,
  SETUP_NAV,
  STD_PRESETS,
  toCode,
} from '@/pages/masters/schoolClassSetupShared'

function SetupNav({ activeKey }) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {SETUP_NAV.map((item) => (
        <Link
          key={item.key}
          to={item.path}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-sm font-medium transition',
            activeKey === item.key
              ? 'border-primary bg-primary/10 text-black'
              : 'border-border text-muted hover:bg-muted/40',
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}

function BulkRows({ rows, setRows, emptyRow, namePlaceholder, codePlaceholder }) {
  return (
    <div className="mt-4 space-y-2">
      <div className="hidden grid-cols-[1fr_1fr_100px_40px] gap-2 text-xs font-semibold text-muted sm:grid">
        <span>Name</span>
        <span>Code</span>
        <span>Sequence</span>
        <span />
      </div>
      {rows.map((row, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_100px_40px]">
          <Input
            placeholder={namePlaceholder}
            value={row.name}
            onChange={(e) => {
              const name = e.target.value
              setRows((prev) =>
                prev.map((r, i) =>
                  i === index ? { ...r, name, code: r.code || toCode(name) } : r,
                ),
              )
            }}
          />
          <Input
            placeholder={codePlaceholder}
            value={row.code}
            onChange={(e) =>
              setRows((prev) =>
                prev.map((r, i) => (i === index ? { ...r, code: e.target.value } : r)),
              )
            }
          />
          <Input
            type="number"
            value={row.sequence}
            onChange={(e) =>
              setRows((prev) =>
                prev.map((r, i) => (i === index ? { ...r, sequence: e.target.value } : r)),
              )
            }
          />
          <button
            type="button"
            className="flex h-10 items-center justify-center text-muted hover:text-danger"
            onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
            disabled={rows.length <= 1}
            title="Remove row"
          >
            <FiTrash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

export function SchoolStandardsSetupPage() {
  const queryClient = useQueryClient()
  const { schoolId, setSchoolId, resolvedOrgId, listParams, listRequestConfig, schoolsQuery, schoolOptions, schoolLocked, selectedSchoolLabel } = useSchoolSetup()
  const [rows, setRows] = useState([emptyStdRow(1), emptyStdRow(2), emptyStdRow(3)])

  const listQuery = useQuery({
    queryKey: ['master-classes-setup', schoolId, resolvedOrgId, 'manage'],
    queryFn: () => masterServices.classes.list(listParams, listRequestConfig),
    enabled: Boolean(schoolId),
    retry: 2,
    retryDelay: 1000,
  })

  const existing = useMemo(() => unwrapList(listQuery.data).results || [], [listQuery.data])

  const mutation = useMutation({
    mutationFn: (items) => masterServices.classes.bulkImport(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-classes-setup'] })
      toast.success('Standards created')
      setRows([emptyStdRow(1)])
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleCreate = () => {
    if (!schoolId) {
      toast.error('Select a school')
      return
    }
    const filled = rows
      .map((row, index) => ({
        name: row.name.trim(),
        code: (row.code || toCode(row.name)).trim().toLowerCase(),
        sequence: Number(row.sequence) || index + 1,
        is_active: true,
        school_id: schoolId,
        ...(resolvedOrgId ? { organization_id: resolvedOrgId } : {}),
      }))
      .filter((row) => row.name && row.code)

    if (!filled.length) {
      toast.error('Add at least one standard')
      return
    }
    const existingCodes = new Set(existing.map((s) => String(s.code || '').toLowerCase()))
    const items = filled.filter((row) => !existingCodes.has(row.code))
    if (!items.length) {
      toast('Those standards already exist')
      return
    }
    mutation.mutate(items)
  }

  if (schoolsQuery.isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Masters', href: '/masters' }, { label: 'Standards' }]} />
      <PageHeader title="Standards" />
      <SetupNav activeKey="standards" />
      <Card>
        <SchoolScopeField
          schoolId={schoolId}
          setSchoolId={setSchoolId}
          schoolOptions={schoolOptions}
          selectedSchoolLabel={selectedSchoolLabel}
          schoolLocked={schoolLocked}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setRows(STD_PRESETS.map((p) => ({ ...p })))}>
            Load Nursery–12
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setRows((prev) => [...prev, emptyStdRow((prev[prev.length - 1]?.sequence || 0) + 1)])
            }
          >
            <FiPlus className="h-4 w-4" /> Add row
          </Button>
        </div>
        <SetupExistingItemsPanel
          items={existing}
          entityLabel="Standard"
          service={masterServices.classes}
          queryKey={['master-classes-setup']}
          requestConfig={listRequestConfig}
          isError={listQuery.isError && !listQuery.isLoading}
          onRetry={() => listQuery.refetch()}
          emptyLabel={
            listQuery.isLoading
              ? 'Loading…'
              : listQuery.isError
                ? getErrorMessage(listQuery.error, 'Could not load.')
                : 'No standards yet.'
          }
        />
        <BulkRows
          rows={rows}
          setRows={setRows}
          emptyRow={emptyStdRow}
          namePlaceholder="e.g. Class 1"
          codePlaceholder="e.g. class_1"
        />
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link to="/masters/setup/sections">
            <Button variant="secondary">
              Sections <FiArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="create" loading={mutation.isPending} onClick={handleCreate} disabled={!schoolId}>
            Create
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function SchoolSectionsSetupPage() {
  const queryClient = useQueryClient()
  const { schoolId, setSchoolId, resolvedOrgId, listParams, listRequestConfig, schoolsQuery, schoolOptions, schoolLocked, selectedSchoolLabel } = useSchoolSetup()
  const [rows, setRows] = useState([emptySectionRow(1), emptySectionRow(2), emptySectionRow(3)])

  const listQuery = useQuery({
    queryKey: ['master-sections-setup', schoolId, resolvedOrgId, 'manage'],
    queryFn: () => masterServices.sections.list(listParams, listRequestConfig),
    enabled: Boolean(schoolId),
    retry: 2,
    retryDelay: 1000,
  })

  const existing = useMemo(() => unwrapList(listQuery.data).results || [], [listQuery.data])

  const mutation = useMutation({
    mutationFn: (items) => masterServices.sections.bulkImport(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-sections-setup'] })
      toast.success('Sections created')
      setRows([emptySectionRow(1)])
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleCreate = () => {
    if (!schoolId) {
      toast.error('Select a school')
      return
    }
    const filled = rows
      .map((row, index) => ({
        name: row.name.trim(),
        code: (row.code || toCode(row.name)).trim().toLowerCase(),
        sequence: Number(row.sequence) || index + 1,
        is_active: true,
        school_id: schoolId,
        school_class: null,
        ...(resolvedOrgId ? { organization_id: resolvedOrgId } : {}),
      }))
      .filter((row) => row.name && row.code)

    if (!filled.length) {
      toast.error('Add at least one section')
      return
    }
    const existingCodes = new Set(existing.map((s) => String(s.code || '').toLowerCase()))
    const items = filled.filter((row) => !existingCodes.has(row.code))
    if (!items.length) {
      toast('Those sections already exist')
      return
    }
    mutation.mutate(items)
  }

  if (schoolsQuery.isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Masters', href: '/masters' }, { label: 'Sections' }]} />
      <PageHeader title="Sections" />
      <SetupNav activeKey="sections" />
      <Card>
        <SchoolScopeField
          schoolId={schoolId}
          setSchoolId={setSchoolId}
          schoolOptions={schoolOptions}
          selectedSchoolLabel={selectedSchoolLabel}
          schoolLocked={schoolLocked}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRows(SECTION_PRESETS.map((p) => ({ ...p })))}
          >
            Load A–D
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setRows((prev) => [...prev, emptySectionRow((prev[prev.length - 1]?.sequence || 0) + 1)])
            }
          >
            <FiPlus className="h-4 w-4" /> Add row
          </Button>
        </div>
        <SetupExistingItemsPanel
          items={existing}
          entityLabel="Section"
          service={masterServices.sections}
          queryKey={['master-sections-setup']}
          requestConfig={listRequestConfig}
          isError={listQuery.isError && !listQuery.isLoading}
          onRetry={() => listQuery.refetch()}
          emptyLabel={
            listQuery.isLoading
              ? 'Loading…'
              : listQuery.isError
                ? getErrorMessage(listQuery.error, 'Could not load.')
                : 'No sections yet.'
          }
        />
        <BulkRows
          rows={rows}
          setRows={setRows}
          emptyRow={emptySectionRow}
          namePlaceholder="e.g. A"
          codePlaceholder="e.g. a"
        />
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Link to="/masters/setup/map">
            <Button variant="secondary">
              Map <FiArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="create" loading={mutation.isPending} onClick={handleCreate} disabled={!schoolId}>
            Create
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function SchoolClassMapSetupPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const {
    schoolId,
    setSchoolId,
    resolvedOrgId,
    activeListParams,
    listRequestConfig,
    schoolsQuery,
    schoolOptions,
    schoolLocked,
    selectedSchoolLabel,
  } = useSchoolSetup()
  const [selectedPairs, setSelectedPairs] = useState(() => new Set())
  const [pairCapacities, setPairCapacities] = useState(() => ({}))

  useEffect(() => {
    setSelectedPairs(new Set())
    setPairCapacities({})
  }, [schoolId])

  const standardsQuery = useQuery({
    queryKey: ['master-classes-setup', schoolId, resolvedOrgId, 'active'],
    queryFn: () => masterServices.classes.list(activeListParams, listRequestConfig),
    enabled: Boolean(schoolId),
    retry: 2,
    retryDelay: 1000,
  })

  const sectionsQuery = useQuery({
    queryKey: ['master-sections-setup', schoolId, resolvedOrgId, 'active'],
    queryFn: () => masterServices.sections.list(activeListParams, listRequestConfig),
    enabled: Boolean(schoolId),
    retry: 2,
    retryDelay: 1000,
  })

  const existingMapsQuery = useQuery({
    queryKey: ['class-section-maps', schoolId],
    queryFn: () =>
      academicServices.classSectionMaps.list({
        page_size: 500,
        school: schoolId,
        is_active: true,
      }),
    enabled: Boolean(schoolId),
  })

  const standards = useMemo(() => unwrapList(standardsQuery.data).results || [], [standardsQuery.data])
  const sections = useMemo(() => unwrapList(sectionsQuery.data).results || [], [sectionsQuery.data])
  const existingMapKeys = useMemo(() => {
    const { results } = unwrapList(existingMapsQuery.data)
    return new Set(
      (results || []).map((row) =>
        pairKey(row.class_id || row.school_class, row.section_id || row.section),
      ),
    )
  }, [existingMapsQuery.data])

  const existingMapsByKey = useMemo(() => {
    const { results } = unwrapList(existingMapsQuery.data)
    const map = new Map()
    ;(results || []).forEach((row) => {
      map.set(pairKey(row.class_id || row.school_class, row.section_id || row.section), row)
    })
    return map
  }, [existingMapsQuery.data])

  const isPairAvailable = (classId, sec) => {
    if (sec.school_class && String(sec.school_class) !== String(classId)) return false
    const key = pairKey(classId, resolveRecordId(sec))
    return !existingMapKeys.has(key)
  }

  const setPairCapacity = (key, value) => {
    setPairCapacities((prev) => {
      const next = { ...prev }
      if (value === '' || value === null || value === undefined) {
        delete next[key]
      } else {
        next[key] = value
      }
      return next
    })
  }

  const getColumnPairKeys = (sec) => {
    const sectionId = resolveRecordId(sec)
    const keys = []
    standards.forEach((std) => {
      const classId = resolveRecordId(std)
      if (isPairAvailable(classId, sec)) {
        keys.push(pairKey(classId, sectionId))
      }
    })
    return keys
  }

  const getColumnCheckState = (sec) => {
    const keys = getColumnPairKeys(sec)
    if (!keys.length) {
      return { checked: false, indeterminate: false, disabled: true }
    }
    const selectedCount = keys.filter((key) => selectedPairs.has(key)).length
    if (selectedCount === 0) {
      return { checked: false, indeterminate: false, disabled: false }
    }
    if (selectedCount === keys.length) {
      return { checked: true, indeterminate: false, disabled: false }
    }
    return { checked: false, indeterminate: true, disabled: false }
  }

  const toggleSectionColumn = (sec) => {
    const keys = getColumnPairKeys(sec)
    if (!keys.length) return
    const allSelected = keys.every((key) => selectedPairs.has(key))
    setSelectedPairs((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        keys.forEach((key) => next.delete(key))
      } else {
        keys.forEach((key) => next.add(key))
      }
      return next
    })
    if (allSelected) {
      setPairCapacities((caps) => {
        const updated = { ...caps }
        keys.forEach((key) => delete updated[key])
        return updated
      })
    }
  }

  const mutation = useMutation({
    mutationFn: (items) => academicServices.classSectionMaps.bulkUpload(items, listRequestConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['class-section-maps'] })
      toast.success('Maps saved')
      navigate('/academics/class-sections')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const togglePair = (classId, sectionId) => {
    const key = pairKey(classId, sectionId)
    if (existingMapKeys.has(key)) return
    setSelectedPairs((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
        setPairCapacities((caps) => {
          const updated = { ...caps }
          delete updated[key]
          return updated
        })
      } else {
        next.add(key)
      }
      return next
    })
  }

  const selectAllPairs = () => {
    const next = new Set()
    standards.forEach((std) => {
      const classId = resolveRecordId(std)
      sections.forEach((sec) => {
        if (!isPairAvailable(classId, sec)) return
        next.add(pairKey(classId, resolveRecordId(sec)))
      })
    })
    setSelectedPairs(next)
  }

  const clearSelection = () => {
    setSelectedPairs(new Set())
    setPairCapacities({})
  }

  const handleMap = () => {
    if (!schoolId) {
      toast.error('Select a school')
      return
    }
    if (!selectedPairs.size) {
      toast.error('Select at least one standard × section pair')
      return
    }
    const items = [...selectedPairs].map((key) => {
      const [school_class, section] = key.split('::')
      const capRaw = pairCapacities[key]
      const item = {
        school_id: schoolId,
        ...(resolvedOrgId ? { organization_id: resolvedOrgId } : {}),
        school_class,
        section,
        is_active: true,
      }
      if (capRaw !== undefined && capRaw !== '') {
        item.capacity = Number(capRaw) || 0
      }
      return item
    })
    mutation.mutate(items)
  }

  if (schoolsQuery.isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Masters', href: '/masters' }, { label: 'Map' }]} />
      <PageHeader title="Map" />
      <SetupNav activeKey="map" />
      <Card>
        <SchoolScopeField
          schoolId={schoolId}
          setSchoolId={setSchoolId}
          schoolOptions={schoolOptions}
          selectedSchoolLabel={selectedSchoolLabel}
          schoolLocked={schoolLocked}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={selectAllPairs}>
            Select all
          </Button>
          <Button variant="secondary" size="sm" onClick={clearSelection}>
            Clear
          </Button>
        </div>

        {existingMapKeys.size > 0 ? (
          <p className="mt-3 text-xs text-muted">{existingMapKeys.size} already mapped</p>
        ) : null}

        {!schoolId ? (
          <p className="mt-4 text-sm text-muted">Select a school.</p>
        ) : standardsQuery.isLoading || sectionsQuery.isLoading ? (
          <p className="mt-4 text-sm text-muted">Loading…</p>
        ) : standardsQuery.isError || sectionsQuery.isError ? (
          <p className="mt-4 text-sm text-danger">
            {getErrorMessage(standardsQuery.error || sectionsQuery.error, 'Could not load.')}
          </p>
        ) : !standards.length || !sections.length ? (
          <div className="mt-4 space-y-2 text-sm">
            <p className="text-muted">Add standards and sections first.</p>
            <div className="flex flex-wrap gap-2">
              <Link to="/masters/setup/standards">
                <Button variant="secondary" size="sm">Standards</Button>
              </Link>
              <Link to="/masters/setup/sections">
                <Button variant="secondary" size="sm">Sections</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Standard</th>
                  {sections.map((sec) => {
                    const sectionId = resolveRecordId(sec)
                    const columnState = getColumnCheckState(sec)
                    return (
                      <th
                        key={sectionId}
                        className="min-w-[5.5rem] px-2 py-2 text-center font-semibold"
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <span>{sec.name}</span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-border"
                            title={`Select all for section ${sec.name}`}
                            checked={columnState.checked}
                            disabled={columnState.disabled}
                            ref={(el) => {
                              if (el) el.indeterminate = columnState.indeterminate
                            }}
                            onChange={() => toggleSectionColumn(sec)}
                          />
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {standards.map((std) => {
                  const classId = resolveRecordId(std)
                  return (
                    <tr key={classId} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{std.name}</td>
                      {sections.map((sec) => {
                        const sectionId = resolveRecordId(sec)
                        const legacyMismatch =
                          sec.school_class && String(sec.school_class) !== String(classId)
                        const key = pairKey(classId, sectionId)
                        const alreadyMapped = existingMapKeys.has(key)
                        const isSelected = selectedPairs.has(key)
                        const existingMap = existingMapsByKey.get(key)
                        return (
                          <td key={sectionId} className="px-2 py-2 align-top">
                            {legacyMismatch ? (
                              <span className="block text-center text-xs text-muted">—</span>
                            ) : (
                              <div className="flex flex-col items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-border"
                                  checked={alreadyMapped || isSelected}
                                  disabled={alreadyMapped}
                                  onChange={() => togglePair(classId, sectionId)}
                                />
                                {alreadyMapped ? (
                                  existingMap?.capacity ? (
                                    <span className="text-[10px] text-muted">{existingMap.capacity}</span>
                                  ) : null
                                ) : isSelected ? (
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="Cap"
                                    title="Capacity (optional)"
                                    className="h-7 w-14 rounded-md border border-border bg-card px-1 text-center text-xs"
                                    value={pairCapacities[key] ?? ''}
                                    onChange={(e) => setPairCapacity(key, e.target.value)}
                                  />
                                ) : null}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {selectedPairs.size > 0 ? (
          <p className="mt-3 text-xs text-muted">Selected: {selectedPairs.size}</p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <Button
            variant="finish"
            loading={mutation.isPending}
            onClick={handleMap}
            disabled={!schoolId || !selectedPairs.size}
          >
            Save
          </Button>
        </div>
      </Card>
    </div>
  )
}
