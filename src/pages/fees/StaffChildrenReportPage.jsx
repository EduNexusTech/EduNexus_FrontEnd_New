import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiDownload } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { academicYearService, feesService } from '@/api/services'
import { listActiveClassSections } from '@/api/activeClassSections'
import { mapClassSectionOptions } from '@/utils/classSections'
import { getErrorMessage, unwrapList } from '@/api/client'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { exportToCsv } from '@/utils/format'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

function SummaryTiles({ summary }) {
  if (!summary) return null
  const tiles = [
    { label: 'Staff children', value: summary.total_staff_children },
    { label: 'Marked on profile', value: summary.marked_on_profile, tone: 'success' },
    { label: 'Staff parent link', value: summary.with_staff_parent },
    { label: 'Staff category', value: summary.by_category },
    { label: 'With concession', value: summary.with_concession, tone: 'warn' },
    { label: 'Total concession', value: summary.total_concession },
    { label: 'Outstanding', value: summary.total_outstanding, tone: 'danger' },
  ]
  const tones = {
    success: 'border-emerald-200 bg-emerald-50/60',
    warn: 'border-amber-200 bg-amber-50/60',
    danger: 'border-red-200 bg-red-50/60',
    default: 'border-slate-200 bg-white',
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`rounded-xl border p-4 ${tones[tile.tone] || tones.default}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tile.label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{tile.value ?? '—'}</p>
        </div>
      ))}
    </div>
  )
}

export default function StaffChildrenReportPage() {
  const schoolScope = useSchoolScopedSelection()
  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope],
  )

  const [yearId, setYearId] = useState('')
  const [sectionId, setSectionId] = useState('')

  const yearsQuery = useQuery({
    queryKey: ['academic-years-staff-children', schoolScope.schoolId],
    queryFn: () =>
      academicYearService.list({
        school: schoolScope.schoolId,
        page_size: 100,
        ordering: '-start_date',
      }),
    enabled: Boolean(schoolScope.schoolId),
  })

  const yearOptions = useMemo(() => {
    const { results } = unwrapList(yearsQuery.data)
    return (results || []).map((y) => ({
      label: y.is_current ? `${y.name} (current)` : y.name,
      value: String(y.id),
    }))
  }, [yearsQuery.data])

  useEffect(() => {
    if (!yearId && yearOptions.length) {
      const current = yearOptions.find((y) => y.label.includes('(current)'))
      setYearId(current?.value || yearOptions[0].value)
    }
  }, [yearId, yearOptions])

  useEffect(() => {
    setSectionId('')
  }, [yearId, schoolScope.schoolId])

  const sectionsQuery = useQuery({
    queryKey: ['class-sections-staff-children', schoolScope.schoolId, yearId],
    queryFn: () =>
      listActiveClassSections({
        schoolId: schoolScope.schoolId,
        academicYearId: yearId,
        pageSize: 500,
      }),
    enabled: Boolean(schoolScope.schoolId && yearId),
  })

  const sectionOptions = useMemo(
    () => [{ label: 'All classes', value: '' }, ...mapClassSectionOptions(sectionsQuery.data?.results || [])],
    [sectionsQuery.data],
  )

  const reportQuery = useQuery({
    queryKey: ['staff-children-report', schoolScope.schoolId, yearId, sectionId],
    queryFn: () =>
      feesService.staffChildrenReport(
        {
          school: schoolScope.schoolId,
          academic_year: yearId,
          ...(sectionId ? { class_section: sectionId } : {}),
        },
        listConfig,
      ),
    enabled: Boolean(schoolScope.schoolId && yearId),
  })

  const report = useMemo(() => unwrap(reportQuery.data), [reportQuery.data])
  const rows = report?.results || []

  const handleExport = () => {
    if (!rows.length) {
      toast.error('No staff children to export')
      return
    }
    exportToCsv(
      rows.map((r) => ({
        'Admission No.': r.admission_number,
        'Student Name': r.full_name,
        Class: r.class_name,
        Section: r.section_name,
        Category: r.category_name,
        'Identified By': r.identification_label,
        'Staff Name': r.staff_name,
        'Employee ID': r.employee_id,
        Department: r.department,
        Designation: r.designation,
        Relation: r.parent_relation,
        'Total Fee': r.total_assigned,
        Concession: r.total_concession,
        Paid: r.total_paid,
        Outstanding: r.outstanding,
        'Fee Status': r.payment_status,
      })),
      `staff-children-${report?.academic_year?.name || yearId}.csv`,
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Reports', href: '/reports' },
          { label: 'Staff Children' },
        ]}
      />
      <PageHeader
        title="Staff Children Report"
        description="Students identified as staff children — by category, linked staff parent, or staff child concession"
        actions={(
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport} disabled={!rows.length}>
              <FiDownload className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
            <Link to="/reports"><Button variant="secondary">Back</Button></Link>
          </div>
        )}
      />

      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <SchoolScopeField
            compact
            schoolId={schoolScope.schoolId}
            setSchoolId={schoolScope.setSchoolId}
            schoolOptions={schoolScope.schoolOptions}
            selectedSchoolLabel={schoolScope.selectedSchoolLabel}
            schoolLocked={schoolScope.schoolLocked}
          />
          <SelectField
            label="Academic year"
            value={yearId}
            onChange={(e) => setYearId(e.target.value)}
            options={[{ label: 'Select…', value: '' }, ...yearOptions]}
          />
          <SelectField
            label="Class (optional)"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            options={sectionOptions}
            disabled={!yearId || sectionsQuery.isLoading}
          />
        </div>
        <p className="mt-3 text-xs text-muted">
          A student appears here if marked as staff child on their profile, has a staff-related category, a parent linked as school employee, or a staff child concession on fees.
        </p>
      </Card>

      {reportQuery.isLoading ? <PageLoader label="Loading staff children…" /> : null}
      {reportQuery.isError ? (
        <ErrorState message={getErrorMessage(reportQuery.error, 'Could not load report')} />
      ) : null}

      {report?.summary ? (
        <>
          <SummaryTiles summary={report.summary} />
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Adm. No.</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Identified by</th>
                    <th className="px-4 py-3">Staff / Parent</th>
                    <th className="px-4 py-3">Emp. ID</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Concession</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Outstanding</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.student_id} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium">{row.admission_number || '—'}</td>
                      <td className="px-4 py-3">{row.full_name}</td>
                      <td className="px-4 py-3">
                        {[row.class_name, row.section_name].filter(Boolean).join(' - ') || '—'}
                      </td>
                      <td className="px-4 py-3">{row.category_name || '—'}</td>
                      <td className="px-4 py-3 text-xs">{row.identification_label}</td>
                      <td className="px-4 py-3">
                        {row.staff_name || '—'}
                        {row.parent_relation ? (
                          <span className="ml-1 text-xs text-muted">({row.parent_relation})</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{row.employee_id || '—'}</td>
                      <td className="px-4 py-3">{row.department || '—'}</td>
                      <td className="px-4 py-3 text-blue-700">{row.total_concession}</td>
                      <td className="px-4 py-3 text-emerald-700">{row.total_paid}</td>
                      <td className="px-4 py-3">{row.outstanding}</td>
                    </tr>
                  ))}
                  {!rows.length ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-10 text-center text-slate-500">
                        No staff children found for this school and academic year.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  )
}
