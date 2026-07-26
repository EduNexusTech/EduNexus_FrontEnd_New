import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiCheck, FiX } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { useAuth } from '@/contexts/AuthContext'
import { academicServices, academicYearService, schoolService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { resolveRecordId } from '@/utils/record'
import { cn } from '@/lib/utils'

/**
 * Academic Structure: activate / deactivate class sections for an academic year.
 * Only active ones are used in academic forms and workflows (admissions, etc.).
 */
export default function ClassSectionActivationPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const userSchoolId = String(user?.school_id || user?.school || '')

  const [schoolId, setSchoolId] = useState(userSchoolId)
  const [academicYearId, setAcademicYearId] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // all | active | inactive

  const schoolsQuery = useQuery({
    queryKey: ['schools-for-activation'],
    queryFn: () => schoolService.list({ page_size: 500, ordering: 'school_name' }),
  })

  const schoolOptions = useMemo(() => {
    const { results } = unwrapList(schoolsQuery.data)
    return (results || []).map((s) => ({
      value: String(resolveRecordId(s) || s.id),
      label: s.school_name || s.name || 'School',
    }))
  }, [schoolsQuery.data])

  const yearsQuery = useQuery({
    queryKey: ['academic-years-activation', schoolId],
    queryFn: () =>
      academicYearService.list({
        page_size: 100,
        school: schoolId,
        ordering: '-start_date',
      }),
    enabled: Boolean(schoolId),
  })

  const yearOptions = useMemo(() => {
    const { results } = unwrapList(yearsQuery.data)
    return (results || []).map((y) => ({
      value: String(resolveRecordId(y) || y.id),
      label: `${y.name}${y.is_current ? ' (Current)' : ''}`,
      isCurrent: Boolean(y.is_current),
    }))
  }, [yearsQuery.data])

  // Auto-pick current year when years load
  useEffect(() => {
    if (academicYearId || !yearOptions.length) return
    const current = yearOptions.find((y) => y.isCurrent)
    if (current) setAcademicYearId(current.value)
  }, [yearOptions, academicYearId])

  const listQuery = useQuery({
    queryKey: ['class-section-activation', schoolId, academicYearId],
    queryFn: () =>
      academicServices.classSections.list({
        page_size: 500,
        school: schoolId,
        academic_year: academicYearId,
        ordering: 'class_name',
      }),
    enabled: Boolean(schoolId && academicYearId),
  })

  const rows = useMemo(() => {
    const { results } = unwrapList(listQuery.data)
    const list = results || []
    if (statusFilter === 'active') return list.filter((r) => r.is_active)
    if (statusFilter === 'inactive') return list.filter((r) => !r.is_active)
    return list
  }, [listQuery.data, statusFilter])

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) =>
      academicServices.classSections.update(id, {
        is_active: active,
        status: active ? 'active' : 'inactive',
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['class-section-activation'] })
      queryClient.invalidateQueries({ queryKey: ['academics-class-sections'] })
      queryClient.invalidateQueries({ queryKey: ['class-sections'] })
      toast.success(vars.active ? 'Class activated for academic year' : 'Class deactivated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, active }) => {
      const items = ids.map((id) => ({
        id,
        is_active: active,
        status: active ? 'active' : 'inactive',
      }))
      return academicServices.classSections.bulkUpdate(items)
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['class-section-activation'] })
      queryClient.invalidateQueries({ queryKey: ['academics-class-sections'] })
      queryClient.invalidateQueries({ queryKey: ['class-sections'] })
      toast.success(vars.active ? 'All listed classes activated' : 'All listed classes deactivated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const activeCount = useMemo(() => {
    const { results } = unwrapList(listQuery.data)
    return (results || []).filter((r) => r.is_active).length
  }, [listQuery.data])

  const totalCount = useMemo(() => unwrapList(listQuery.data).results?.length || 0, [listQuery.data])

  if (schoolsQuery.isLoading) return <PageLoader />

  return (
    <div className="space-y-5">
      <Breadcrumb
        items={[
          { label: 'Academic Foundation', href: '/academics' },
          { label: 'Active Classes' },
        ]}
      />
      <PageHeader
        title="Active Classes (Academic Year)"
        description="Turn class sections on/off for the selected year. Only active classes appear in academic forms and workflows."
        actions={
          <Link to="/masters/setup/standards">
            <Button variant="secondary">Create STD / Section / Map</Button>
          </Link>
        }
      />

      <Card>
        <div className="grid gap-3 sm:grid-cols-3">
          <SelectField
            label="School"
            required
            value={schoolId}
            onChange={(e) => {
              setSchoolId(e.target.value)
              setAcademicYearId('')
            }}
            options={schoolOptions}
            placeholder="Select school..."
          />
          <SelectField
            label="Academic year"
            required
            value={academicYearId}
            onChange={(e) => setAcademicYearId(e.target.value)}
            options={yearOptions}
            placeholder="Select academic year..."
          />
          <SelectField
            label="Show"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active only' },
              { value: 'inactive', label: 'Inactive only' },
            ]}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted">
            Active: <span className="font-semibold text-black">{activeCount}</span> / {totalCount}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="success"
              size="sm"
              disabled={!rows.length || bulkMutation.isPending}
              onClick={() =>
                bulkMutation.mutate({
                  ids: rows.map((r) => resolveRecordId(r)),
                  active: true,
                })
              }
            >
              <FiCheck className="h-4 w-4" /> Activate listed
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!rows.length || bulkMutation.isPending}
              onClick={() =>
                bulkMutation.mutate({
                  ids: rows.map((r) => resolveRecordId(r)),
                  active: false,
                })
              }
            >
              <FiX className="h-4 w-4" /> Deactivate listed
            </Button>
          </div>
        </div>

        {!schoolId || !academicYearId ? (
          <p className="mt-6 text-sm text-muted">Select school and academic year to manage classes.</p>
        ) : listQuery.isLoading ? (
          <PageLoader />
        ) : listQuery.error ? (
          <ErrorState message={getErrorMessage(listQuery.error)} onRetry={() => listQuery.refetch()} />
        ) : rows.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center">
            <p className="text-sm text-muted">No mapped class sections for this year yet.</p>
            <Link to="/masters/setup/map" className="mt-3 inline-block">
              <Button variant="create">Map standards & sections</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-border">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Class</th>
                  <th className="px-3 py-2 text-left font-semibold">Section</th>
                  <th className="px-3 py-2 text-left font-semibold">Capacity</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const id = resolveRecordId(row)
                  const active = Boolean(row.is_active)
                  return (
                    <tr key={id} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{row.class_name || '—'}</td>
                      <td className="px-3 py-2">{row.section_name || '—'}</td>
                      <td className="px-3 py-2">{row.capacity ?? '—'}</td>
                      <td className="px-3 py-2">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                            active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-slate-100 text-slate-600',
                          )}
                        >
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          size="sm"
                          variant={active ? 'secondary' : 'success'}
                          loading={toggleMutation.isPending}
                          onClick={() => toggleMutation.mutate({ id, active: !active })}
                        >
                          {active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
