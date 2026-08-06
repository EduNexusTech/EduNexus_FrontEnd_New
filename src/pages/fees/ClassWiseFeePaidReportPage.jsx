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
import { exportToCsv, formatDateTime } from '@/utils/format'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const STATUS_OPTIONS = [
  { label: 'All statuses', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'No fees', value: 'none' },
]

const STATUS_BADGE = {
  paid: 'bg-emerald-100 text-emerald-800',
  partial: 'bg-amber-100 text-amber-800',
  unpaid: 'bg-red-100 text-red-800',
  none: 'bg-slate-100 text-slate-600',
}

function StatusBadge({ status }) {
  const label = status === 'none' ? 'No fees' : status
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[status] || STATUS_BADGE.none}`}>
      {label}
    </span>
  )
}

function SummaryTiles({ summary }) {
  if (!summary) return null
  const tiles = [
    { label: 'Students', value: summary.total_students },
    { label: 'Paid', value: summary.paid_count, tone: 'success' },
    { label: 'Partial', value: summary.partial_count, tone: 'warn' },
    { label: 'Unpaid', value: summary.unpaid_count, tone: 'danger' },
    { label: 'Collected', value: summary.total_paid },
    { label: 'Outstanding', value: summary.total_outstanding },
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

export default function ClassWiseFeePaidReportPage() {
  const schoolScope = useSchoolScopedSelection()
  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope],
  )

  const [yearId, setYearId] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const yearsQuery = useQuery({
    queryKey: ['academic-years-fee-paid-report', schoolScope.schoolId],
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
    setTemplateId('')
    setSectionId('')
    setStatusFilter('all')
  }, [yearId, schoolScope.schoolId])

  const templatesQuery = useQuery({
    queryKey: ['fee-templates-paid-report', schoolScope.schoolId, yearId],
    queryFn: () =>
      feesService.templates(
        { school: schoolScope.schoolId, academic_year: yearId, page_size: 200, is_active: true },
        listConfig,
      ),
    enabled: Boolean(schoolScope.schoolId && yearId),
  })

  const templateOptions = useMemo(() => {
    const { results } = unwrapList(templatesQuery.data)
    return (results || []).map((t) => ({
      label: t.code ? `${t.name} (${t.code})` : t.name,
      value: String(t.id),
    }))
  }, [templatesQuery.data])

  useEffect(() => {
    setSectionId('')
    setStatusFilter('all')
  }, [templateId])

  const sectionsQuery = useQuery({
    queryKey: ['class-sections-fee-paid', schoolScope.schoolId, yearId],
    queryFn: () =>
      listActiveClassSections({
        schoolId: schoolScope.schoolId,
        academicYearId: yearId,
        pageSize: 500,
      }),
    enabled: Boolean(schoolScope.schoolId && yearId),
  })

  const sections = useMemo(() => sectionsQuery.data?.results || [], [sectionsQuery.data])

  const sectionOptions = useMemo(
    () => mapClassSectionOptions(sections, { includeCount: true }),
    [sections],
  )

  const selectedSection = useMemo(
    () => sections.find((cs) => String(cs.id) === sectionId),
    [sections, sectionId],
  )

  const overviewQuery = useQuery({
    queryKey: ['class-wise-fee-paid-overview', schoolScope.schoolId, yearId, templateId],
    queryFn: async () => {
      const res = await feesService.classWiseFeePaid(
        { school: schoolScope.schoolId, academic_year: yearId, template_id: templateId },
        listConfig,
      )
      return unwrap(res)
    },
    enabled: Boolean(schoolScope.schoolId && yearId && templateId && !sectionId),
  })

  const detailQuery = useQuery({
    queryKey: ['class-wise-fee-paid-detail', schoolScope.schoolId, yearId, templateId, sectionId, statusFilter],
    queryFn: async () => {
      const res = await feesService.classWiseFeePaid(
        {
          school: schoolScope.schoolId,
          academic_year: yearId,
          template_id: templateId,
          class_section: sectionId,
          status: statusFilter,
        },
        listConfig,
      )
      return unwrap(res)
    },
    enabled: Boolean(schoolScope.schoolId && yearId && templateId && sectionId),
  })

  const report = sectionId ? detailQuery.data : overviewQuery.data
  const isLoading = sectionId ? detailQuery.isLoading : overviewQuery.isLoading
  const error = sectionId ? detailQuery.error : overviewQuery.error
  const refetch = sectionId ? detailQuery.refetch : overviewQuery.refetch

  const students = report?.students || []
  const classes = report?.classes || []

  const handleExportOverview = () => {
    if (!classes.length) {
      toast.error('No data to export')
      return
    }
    exportToCsv(
      classes,
      [
        { header: 'Class', accessor: (r) => r.class_name || '' },
        { header: 'Section', accessor: (r) => r.section_name || '' },
        { header: 'Students', accessor: (r) => r.total_students ?? '' },
        { header: 'Paid', accessor: (r) => r.paid_count ?? '' },
        { header: 'Partial', accessor: (r) => r.partial_count ?? '' },
        { header: 'Unpaid', accessor: (r) => r.unpaid_count ?? '' },
        { header: 'Collected', accessor: (r) => r.total_paid ?? '' },
        { header: 'Outstanding', accessor: (r) => r.total_outstanding ?? '' },
      ],
      'class-wise-fee-paid-summary.csv',
    )
    toast.success('Report exported')
  }

  const handleExportStudents = () => {
    if (!students.length) {
      toast.error('No students to export')
      return
    }
    const classLabel = selectedSection
      ? `${selectedSection.class_name}-${selectedSection.section_name}`
      : 'class'
    exportToCsv(
      students,
      [
        { header: 'Admission No.', accessor: (r) => r.admission_number || '' },
        { header: 'Name', accessor: (r) => r.full_name || '' },
        { header: 'Roll No.', accessor: (r) => r.roll_number || '' },
        { header: 'Assigned', accessor: (r) => r.total_assigned || r.total_invoiced || '' },
        { header: 'Concession', accessor: (r) => r.total_concession || '' },
        { header: 'Paid', accessor: (r) => r.total_paid || '' },
        { header: 'Outstanding', accessor: (r) => r.outstanding || '' },
        { header: 'Status', accessor: (r) => r.payment_status || '' },
        { header: 'Last Payment', accessor: (r) => (r.last_payment_at ? formatDateTime(r.last_payment_at) : '') },
        { header: 'Receipt #', accessor: (r) => r.last_receipt_number || '' },
      ],
      `fee-paid-${classLabel}.csv`,
    )
    toast.success('Report exported')
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Fees', href: '/fees' },
          { label: 'Class-wise Fee Paid' },
        ]}
      />
      <PageHeader
        title="Class-wise Fee Paid Report"
        description="View who has paid fees for a selected fee structure — summary by class or student list for a section"
        actions={
          <Link to="/fees">
            <Button variant="secondary">Back to Fees Hub</Button>
          </Link>
        }
      />

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SchoolScopeField
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
            required
          />
          <SelectField
            label="Fee structure"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            options={[{ label: 'Select fee structure…', value: '' }, ...templateOptions]}
            disabled={!yearId || templatesQuery.isLoading}
            required
          />
          <SelectField
            label="Class & section"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            options={[
              { label: 'All classes (summary)', value: '' },
              ...sectionOptions,
            ]}
            disabled={!yearId || !templateId || sectionsQuery.isLoading}
          />
          {sectionId ? (
            <SelectField
              label="Payment status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={STATUS_OPTIONS}
            />
          ) : null}
        </div>

        {report?.fee_structure ? (
          <p className="mt-3 text-sm text-muted">
            Showing payment status for fee structure:{' '}
            <span className="font-medium text-foreground">
              {report.fee_structure.name}
              {report.fee_structure.code ? ` (${report.fee_structure.code})` : ''}
            </span>
            . Only payments collected against this structure are included.
          </p>
        ) : null}

        {report?.summary ? (
          <div className="mt-5 space-y-4">
            <SummaryTiles summary={report.summary} />
            <div className="flex flex-wrap justify-end gap-2">
              {!sectionId ? (
                <Button variant="excel" disabled={!classes.length} onClick={handleExportOverview}>
                  <FiDownload className="h-4 w-4" /> Export Summary
                </Button>
              ) : (
                <Button variant="excel" disabled={!students.length} onClick={handleExportStudents}>
                  <FiDownload className="h-4 w-4" /> Export Students
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </Card>

      {!yearId ? (
        <Card className="p-6 text-center text-sm text-muted">
          Select school and academic year to load fee structures.
        </Card>
      ) : !templateId ? (
        <Card className="p-6 text-center text-sm text-muted">
          Select fee structure to load the data.
        </Card>
      ) : isLoading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : !sectionId ? (
        <Card padding={false} className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Class</th>
                <th className="px-4 py-3 text-left font-semibold">Section</th>
                <th className="px-4 py-3 text-right font-semibold">Students</th>
                <th className="px-4 py-3 text-right font-semibold">Paid</th>
                <th className="px-4 py-3 text-right font-semibold">Partial</th>
                <th className="px-4 py-3 text-right font-semibold">Unpaid</th>
                <th className="px-4 py-3 text-right font-semibold">Collected</th>
                <th className="px-4 py-3 text-right font-semibold">Outstanding</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-muted">
                    No enrolled students found for this academic year.
                  </td>
                </tr>
              ) : (
                classes.map((row) => (
                  <tr key={row.class_section_id} className="border-t border-border">
                    <td className="px-4 py-2 font-medium">{row.class_name || '—'}</td>
                    <td className="px-4 py-2">{row.section_name || '—'}</td>
                    <td className="px-4 py-2 text-right">{row.total_students}</td>
                    <td className="px-4 py-2 text-right text-emerald-700">{row.paid_count}</td>
                    <td className="px-4 py-2 text-right text-amber-700">{row.partial_count}</td>
                    <td className="px-4 py-2 text-right text-red-700">{row.unpaid_count}</td>
                    <td className="px-4 py-2 text-right">{row.total_paid}</td>
                    <td className="px-4 py-2 text-right">{row.total_outstanding}</td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => setSectionId(row.class_section_id)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View students
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      ) : (
        <Card padding={false} className="overflow-x-auto">
          {selectedSection ? (
            <div className="border-b border-border bg-slate-50/80 px-4 py-3">
              <p className="font-semibold text-foreground">
                {selectedSection.class_name} — {selectedSection.section_name}
              </p>
              <p className="text-sm text-muted">
                {students.length} student(s)
                {statusFilter !== 'all' ? ` · filtered by ${statusFilter}` : ''}
              </p>
            </div>
          ) : null}
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Admission No.</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Roll No.</th>
                <th className="px-4 py-3 text-right font-semibold">Assigned</th>
                <th className="px-4 py-3 text-right font-semibold">Concession</th>
                <th className="px-4 py-3 text-right font-semibold">Paid</th>
                <th className="px-4 py-3 text-right font-semibold">Outstanding</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Last Payment</th>
                <th className="px-4 py-3 text-left font-semibold">Receipt #</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-muted">
                    No students match the selected filters.
                  </td>
                </tr>
              ) : (
                students.map((row) => (
                  <tr key={row.student_id} className="border-t border-border">
                    <td className="px-4 py-2">{row.admission_number || '—'}</td>
                    <td className="px-4 py-2 font-medium">{row.full_name || '—'}</td>
                    <td className="px-4 py-2">{row.roll_number || '—'}</td>
                    <td className="px-4 py-2 text-right">{row.total_assigned ?? row.total_invoiced}</td>
                    <td className="px-4 py-2 text-right text-blue-700">{row.total_concession || '—'}</td>
                    <td className="px-4 py-2 text-right">{row.total_paid}</td>
                    <td className="px-4 py-2 text-right">{row.outstanding}</td>
                    <td className="px-4 py-2"><StatusBadge status={row.payment_status} /></td>
                    <td className="px-4 py-2">{row.last_payment_at ? formatDateTime(row.last_payment_at) : '—'}</td>
                    <td className="px-4 py-2">{row.last_receipt_number || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {sectionId ? (
            <div className="border-t border-border px-4 py-3">
              <button
                type="button"
                onClick={() => setSectionId('')}
                className="text-sm font-medium text-primary hover:underline"
              >
                ← Back to all classes summary
              </button>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  )
}
