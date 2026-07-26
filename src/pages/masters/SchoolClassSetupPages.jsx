import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiArrowRight, FiPlus, FiTrash2 } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Feedback'
import { useAuth } from '@/contexts/AuthContext'
import {
  academicServices,
  academicYearService,
  masterServices,
  schoolService,
} from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { resolveRecordId } from '@/utils/record'
import { cn } from '@/lib/utils'
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

function useSchoolOptions() {
  const { user } = useAuth()
  const userSchoolId = String(user?.school_id || user?.school || '')

  const schoolsQuery = useQuery({
    queryKey: ['schools-for-class-setup'],
    queryFn: () => schoolService.list({ page_size: 500, ordering: 'school_name' }),
  })

  const schoolOptions = useMemo(() => {
    const { results } = unwrapList(schoolsQuery.data)
    return (results || []).map((s) => ({
      value: String(resolveRecordId(s) || s.id),
      label: s.school_name || s.name || 'School',
      organizationId: String(s.organization_id || s.organization || ''),
    }))
  }, [schoolsQuery.data])

  return { user, userSchoolId, schoolsQuery, schoolOptions }
}

function SchoolPicker({ schoolId, setSchoolId, schoolOptions, onOrgChange }) {
  return (
    <div className="max-w-md">
      <SelectField
        label="School"
        required
        value={schoolId}
        onChange={(e) => {
          const value = e.target.value
          setSchoolId(value)
          const match = schoolOptions.find((s) => s.value === value)
          onOrgChange?.(match?.organizationId || '')
        }}
        options={schoolOptions}
        placeholder="Select school..."
      />
      <p className="mt-1 text-xs text-muted">All create steps use school only — no academic year here.</p>
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

function ExistingChips({ items, emptyLabel }) {
  if (!items.length) {
    return <p className="mt-4 text-sm text-muted">{emptyLabel}</p>
  }
  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/20 p-3">
      <p className="mb-2 text-xs font-semibold uppercase text-muted">Already created</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={resolveRecordId(item)}
            className="rounded-md border border-border bg-card px-2 py-1 text-xs"
          >
            {item.name}
            <span className="text-muted"> ({item.code})</span>
            {item.class_name ? <span className="text-muted"> → {item.class_name}</span> : null}
          </span>
        ))}
      </div>
    </div>
  )
}

export function SchoolStandardsSetupPage() {
  const queryClient = useQueryClient()
  const { userSchoolId, schoolsQuery, schoolOptions } = useSchoolOptions()
  const [schoolId, setSchoolId] = useState(userSchoolId)
  const [organizationId, setOrganizationId] = useState('')
  const [rows, setRows] = useState([emptyStdRow(1), emptyStdRow(2), emptyStdRow(3)])

  const resolvedOrgId =
    organizationId ||
    schoolOptions.find((s) => s.value === schoolId)?.organizationId ||
    ''

  const listQuery = useQuery({
    queryKey: ['master-classes-setup', resolvedOrgId],
    queryFn: () =>
      masterServices.classes.list({
        page_size: 500,
        is_active: true,
        organization: resolvedOrgId || undefined,
        ordering: 'sequence',
      }),
    enabled: Boolean(resolvedOrgId),
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
      <PageHeader
        title="Create Standards (STD)"
        description="School-based standards catalog. No academic year needed."
      />
      <SetupNav activeKey="standards" />
      <Card>
        <SchoolPicker
          schoolId={schoolId}
          setSchoolId={setSchoolId}
          schoolOptions={schoolOptions}
          onOrgChange={setOrganizationId}
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
        <ExistingChips items={existing} emptyLabel="No standards yet for this school’s organization." />
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
              Next: Sections <FiArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="create" loading={mutation.isPending} onClick={handleCreate} disabled={!schoolId}>
            Create standards
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function SchoolSectionsSetupPage() {
  const queryClient = useQueryClient()
  const { userSchoolId, schoolsQuery, schoolOptions } = useSchoolOptions()
  const [schoolId, setSchoolId] = useState(userSchoolId)
  const [organizationId, setOrganizationId] = useState('')
  const [rows, setRows] = useState([emptySectionRow(1), emptySectionRow(2), emptySectionRow(3)])

  const resolvedOrgId =
    organizationId ||
    schoolOptions.find((s) => s.value === schoolId)?.organizationId ||
    ''

  const listQuery = useQuery({
    queryKey: ['master-sections-setup', resolvedOrgId],
    queryFn: () =>
      masterServices.sections.list({
        page_size: 500,
        is_active: true,
        organization: resolvedOrgId || undefined,
        ordering: 'sequence',
      }),
    enabled: Boolean(resolvedOrgId),
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
      <PageHeader
        title="Create Sections"
        description="Create section labels (A, B, C…) by school. Map them to standards in the next step."
      />
      <SetupNav activeKey="sections" />
      <Card>
        <SchoolPicker
          schoolId={schoolId}
          setSchoolId={setSchoolId}
          schoolOptions={schoolOptions}
          onOrgChange={setOrganizationId}
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
        <ExistingChips items={existing} emptyLabel="No sections yet for this school’s organization." />
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
              Next: Map <FiArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="create" loading={mutation.isPending} onClick={handleCreate} disabled={!schoolId}>
            Create sections
          </Button>
        </div>
      </Card>
    </div>
  )
}

export function SchoolClassMapSetupPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { userSchoolId, schoolsQuery, schoolOptions } = useSchoolOptions()
  const [schoolId, setSchoolId] = useState(userSchoolId)
  const [organizationId, setOrganizationId] = useState('')
  const [academicYearId, setAcademicYearId] = useState('')
  const [selectedPairs, setSelectedPairs] = useState(() => new Set())
  const [defaultCapacity, setDefaultCapacity] = useState(40)

  const resolvedOrgId =
    organizationId ||
    schoolOptions.find((s) => s.value === schoolId)?.organizationId ||
    ''

  const standardsQuery = useQuery({
    queryKey: ['master-classes-setup', resolvedOrgId],
    queryFn: () =>
      masterServices.classes.list({
        page_size: 500,
        is_active: true,
        organization: resolvedOrgId || undefined,
        ordering: 'sequence',
      }),
    enabled: Boolean(resolvedOrgId),
  })

  const sectionsQuery = useQuery({
    queryKey: ['master-sections-setup', resolvedOrgId],
    queryFn: () =>
      masterServices.sections.list({
        page_size: 500,
        is_active: true,
        organization: resolvedOrgId || undefined,
        ordering: 'sequence',
      }),
    enabled: Boolean(resolvedOrgId),
  })

  const yearsQuery = useQuery({
    queryKey: ['academic-years-setup', schoolId],
    queryFn: () =>
      academicYearService.list({
        page_size: 100,
        school: schoolId,
        ordering: '-start_date',
      }),
    enabled: Boolean(schoolId),
  })

  const standards = useMemo(() => unwrapList(standardsQuery.data).results || [], [standardsQuery.data])
  const sections = useMemo(() => unwrapList(sectionsQuery.data).results || [], [sectionsQuery.data])
  const yearOptions = useMemo(() => {
    const { results } = unwrapList(yearsQuery.data)
    return (results || []).map((y) => ({
      value: String(resolveRecordId(y) || y.id),
      label: `${y.name}${y.is_current ? ' (Current)' : ''}`,
    }))
  }, [yearsQuery.data])

  const mutation = useMutation({
    mutationFn: (items) => academicServices.classSections.bulkUpload(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academics-class-sections'] })
      toast.success('Mapped. Activate them under Academic Structure → Active Classes.')
      navigate('/academics/class-sections')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const togglePair = (classId, sectionId) => {
    const key = pairKey(classId, sectionId)
    setSelectedPairs((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectAllPairs = () => {
    const next = new Set()
    standards.forEach((std) => {
      const classId = resolveRecordId(std)
      sections.forEach((sec) => {
        if (sec.school_class && String(sec.school_class) !== String(classId)) return
        next.add(pairKey(classId, resolveRecordId(sec)))
      })
    })
    setSelectedPairs(next)
  }

  const handleMap = () => {
    if (!schoolId) {
      toast.error('Select a school')
      return
    }
    if (!academicYearId) {
      toast.error('Select an academic year for the mapping year-slot')
      return
    }
    if (!selectedPairs.size) {
      toast.error('Select at least one standard × section pair')
      return
    }
    // Created inactive — activate later in Academics for forms/workflows
    const items = [...selectedPairs].map((key) => {
      const [school_class, section] = key.split('::')
      return {
        school_id: schoolId,
        academic_year_id: academicYearId,
        school_class,
        section,
        capacity: Number(defaultCapacity) || 0,
        status: 'inactive',
        is_active: false,
      }
    })
    mutation.mutate(items)
  }

  if (schoolsQuery.isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Masters', href: '/masters' }, { label: 'Map' }]} />
      <PageHeader
        title="Map Sections to Standards"
        description="School-based mapping. New class sections are created inactive — activate them in Academic Structure for forms and workflows."
      />
      <SetupNav activeKey="map" />
      <Card>
        <div className="grid gap-3 sm:grid-cols-2">
          <SchoolPicker
            schoolId={schoolId}
            setSchoolId={setSchoolId}
            schoolOptions={schoolOptions}
            onOrgChange={setOrganizationId}
          />
          <SelectField
            label="Academic year (mapping year)"
            required
            value={academicYearId}
            onChange={(e) => setAcademicYearId(e.target.value)}
            options={yearOptions}
            placeholder="Select academic year..."
          />
        </div>
        <div className="mt-3 max-w-xs">
          <Input
            label="Default capacity"
            type="number"
            value={defaultCapacity}
            onChange={(e) => setDefaultCapacity(e.target.value)}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={selectAllPairs}>
            Select all
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSelectedPairs(new Set())}>
            Clear
          </Button>
        </div>

        {!standards.length || !sections.length ? (
          <p className="mt-4 text-sm text-danger">
            Create standards and sections first using the Masters setup steps.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Standard</th>
                  {sections.map((sec) => (
                    <th key={resolveRecordId(sec)} className="px-3 py-2 text-center font-semibold">
                      {sec.name}
                    </th>
                  ))}
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
                        return (
                          <td key={sectionId} className="px-3 py-2 text-center">
                            {legacyMismatch ? (
                              <span className="text-xs text-muted">—</span>
                            ) : (
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-border"
                                checked={selectedPairs.has(key)}
                                onChange={() => togglePair(classId, sectionId)}
                              />
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

        <p className="mt-3 text-xs text-muted">Selected mappings: {selectedPairs.size}</p>

        <div className="mt-6 flex justify-end">
          <Button
            variant="finish"
            loading={mutation.isPending}
            onClick={handleMap}
            disabled={!schoolId || !academicYearId || !selectedPairs.size}
          >
            Map & create (inactive)
          </Button>
        </div>
      </Card>
    </div>
  )
}
