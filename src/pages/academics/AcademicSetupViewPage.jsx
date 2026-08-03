import { Link } from 'react-router-dom'
import { FiSettings, FiStar } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import { PageHeader, Card } from '@/components/ui/Card'
import { PageLoader } from '@/components/ui/Feedback'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { useAdmissionSetup } from '@/features/admissions/hooks/useAdmissionSetup'
import { ADMISSION_FEATURE_META } from '@/features/admissions/types/setup'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function YearReadOnlyCard({ year }) {
  const enabledModules = Object.entries(year.features || {})
    .filter(([, on]) => on)
    .map(([key]) => ADMISSION_FEATURE_META[key]?.label || key)

  return (
    <Card className={year.isCurrent ? 'border-brand-300 ring-1 ring-brand-200' : ''}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{year.label}</h3>
            {year.isCurrent ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-800">
                <FiStar className="h-3 w-3" /> Current
              </span>
            ) : null}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                year.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {year.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(year.startDate)} — {formatDate(year.endDate)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Enabled admission modules
        </p>
        {enabledModules.length ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {enabledModules.map((label) => (
              <span
                key={label}
                className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800"
              >
                {label}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No modules enabled</p>
        )}
      </div>
    </Card>
  )
}

export default function AcademicSetupViewPage() {
  const {
    academicYears,
    currentYear,
    loading,
    emailSettings,
    schoolId,
    setSchoolId,
    schoolOptions,
    selectedSchoolLabel,
    schoolsLoading,
    schoolLocked,
  } = useAdmissionSetup()

  const activeCount = academicYears.filter((y) => y.status === 'active').length

  if (schoolsLoading || loading) return <PageLoader />

  return (
    <div className="lms-page w-full space-y-6">
      <Breadcrumb
        items={[
          { label: 'Academic Foundation', href: '/academics' },
          { label: 'Academic Years' },
        ]}
      />
      <PageHeader
        title="Academic Years"
        actions={
          <Link to="/admissions/setup">
            <Button variant="primary">
              <FiSettings className="h-4 w-4" />
              Manage in Admissions
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="max-w-md">
          <SchoolScopeField
            schoolId={schoolId}
            setSchoolId={setSchoolId}
            schoolOptions={schoolOptions}
            selectedSchoolLabel={selectedSchoolLabel}
            schoolLocked={schoolLocked}
          />
        </div>
        {selectedSchoolLabel ? (
          <p className="mt-2 text-sm text-muted-foreground">
            {schoolLocked
              ? 'Showing academic years for your assigned school.'
              : (
                <>
                  Showing academic years for{' '}
                  <strong className="text-foreground">{selectedSchoolLabel}</strong>.
                </>
              )}
          </p>
        ) : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total Years</p>
          <p className="mt-1 text-2xl font-bold">{academicYears.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active Years</p>
          <p className="mt-1 text-2xl font-bold">{activeCount}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current Year</p>
          <p className="mt-1 text-2xl font-bold">{currentYear?.label ?? '—'}</p>
        </Card>
      </div>

      {emailSettings?.senderEmail || emailSettings?.senderName ? (
        <Card>
          <h3 className="text-sm font-semibold">Email sender</h3>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Sender</dt>
              <dd className="font-medium">
                {emailSettings.senderName || '—'}
                {emailSettings.senderEmail ? ` <${emailSettings.senderEmail}>` : ''}
              </dd>
            </div>
          </dl>
        </Card>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Years</h2>
        {!schoolId ? (
          <Card className="border-dashed text-center">
            <p className="text-muted-foreground">Select a school to view academic years.</p>
          </Card>
        ) : academicYears.length === 0 ? (
          <Card className="border-dashed text-center">
            <p className="text-muted-foreground">No years for this school.</p>
            <Link to="/admissions/setup" className="mt-4 inline-block">
              <Button variant="primary">Add Academic Year</Button>
            </Link>
          </Card>
        ) : (
          academicYears.map((year) => <YearReadOnlyCard key={year.id} year={year} />)
        )}
      </div>
    </div>
  )
}
