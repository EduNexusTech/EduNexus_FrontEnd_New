import { Link } from 'react-router-dom'
import {
  FiMessageSquare,
  FiGitBranch,
  FiClock,
  FiFileText,
  FiGlobe,
  FiUserCheck,
  FiSettings,
  FiPlus,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { AdmissionsSubNav } from '@/features/admissions/components/AdmissionsSubNav'
import { AcademicYearSelector } from '@/features/admissions/components/AcademicYearSelector'
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAdmissionSetup } from '@/features/admissions/hooks/useAdmissionSetup'

const QUICK_LINKS = [
  { to: '/admissions/setup', label: 'Academic Year Setup', icon: FiSettings, desc: 'Years & module flags' },
  { to: '/admissions/enquiries', label: 'Enquiries', icon: FiMessageSquare, desc: 'Capture leads' },
  { to: '/admissions/pipeline', label: 'Pipeline', icon: FiGitBranch, desc: 'Stage board' },
  { to: '/admissions/follow-ups', label: 'Follow-ups', icon: FiClock, desc: 'Scheduled tasks' },
  { to: '/admissions/applications/internal', label: 'Internal Apps', icon: FiFileText, desc: 'In-house forms' },
  { to: '/admissions/applications/external', label: 'External Apps', icon: FiGlobe, desc: 'Online forms' },
  { to: '/admissions/conversion', label: 'Conversion', icon: FiUserCheck, desc: 'Enroll students' },
]

export default function AdmissionsHubPage() {
  const { currentYear, isYearActive, enabledFeatures } = useAdmissionSetup()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admissions"
        description={
          currentYear
            ? `${currentYear.label} — ${isYearActive ? 'active' : 'inactive'} · ${enabledFeatures.length} modules enabled`
            : 'Admission pipeline overview'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AcademicYearSelector />
            <Link to="/admissions/enquiries">
              <Button variant="primary">
                <FiPlus className="h-4 w-4" />
                New Enquiry
              </Button>
            </Link>
          </div>
        }
      />

      <AdmissionsSubNav />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Current Year" value={currentYear?.label ?? '—'} icon={FiSettings} />
        <StatCard
          title="Year Status"
          value={isYearActive ? 'Active' : 'Inactive'}
          icon={FiGitBranch}
          color={isYearActive ? 'success' : 'warning'}
        />
        <StatCard title="Enabled Modules" value={String(enabledFeatures.length)} icon={FiFileText} />
        <StatCard title="Quick Actions" value={String(QUICK_LINKS.length)} icon={FiUserCheck} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {QUICK_LINKS.map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to}>
            <Card hover className="h-full">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card padding={false}>
        <CardHeader>
          <CardTitle className="text-base">Getting started</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ol className="list-inside list-decimal space-y-1">
            <li>
              Open <strong className="text-foreground">Setup</strong> and configure Academic Years (same as
              LMS_School Admission Year setup).
            </li>
            <li>Enable modules per year (Enquiry, Applications, Follow-ups, Conversion, etc.).</li>
            <li>Capture enquiries, move leads through the pipeline, then convert to enrolled students.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
