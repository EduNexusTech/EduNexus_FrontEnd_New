import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiMessageSquare,
  FiGitBranch,
  FiClock,
  FiFileText,
  FiGlobe,
  FiUserCheck,
  FiSettings,
  FiPlus,
  FiPieChart,
  FiGrid,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { AdmissionsSubNav } from '@/features/admissions/components/AdmissionsSubNav'
import { AcademicYearSelector } from '@/features/admissions/components/AcademicYearSelector'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useAdmissionSetup } from '@/features/admissions/hooks/useAdmissionSetup'
import { admissionService } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'

const QUICK_LINKS = [
  { to: '/admissions/setup', label: 'Academic Year Setup', icon: FiSettings, desc: 'Years & module flags' },
  { to: '/admissions/enquiries', label: 'Enquiries', icon: FiMessageSquare, desc: 'CRM lead capture' },
  { to: '/admissions/pipeline', label: 'Pipeline', icon: FiGitBranch, desc: 'Stage board' },
  { to: '/admissions/follow-ups', label: 'Follow-ups', icon: FiClock, desc: 'Counselor tasks' },
  { to: '/admissions/applications/internal', label: 'Internal Apps', icon: FiFileText, desc: 'In-house forms' },
  { to: '/admissions/applications/external', label: 'External Apps', icon: FiGlobe, desc: 'Online forms' },
  { to: '/admissions/conversion', label: 'Conversion', icon: FiUserCheck, desc: 'Prepare SIS conversion' },
]

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

export default function AdmissionsHubPage() {
  const { currentYear, isYearActive, enabledFeatures } = useAdmissionSetup()
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const funnelQuery = useQuery({
    queryKey: ['admission-funnel', schoolId],
    queryFn: () => admissionService.analyticsFunnel(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })
  const statsQuery = useQuery({
    queryKey: ['admission-pipeline-stats'],
    queryFn: () => admissionService.applications.pipelineStats(),
  })

  const funnel = useMemo(() => unwrap(funnelQuery.data), [funnelQuery.data])
  const pipeline = useMemo(() => unwrap(statsQuery.data), [statsQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Management"
        description={
          currentYear
            ? `${currentYear.label} — CRM pipeline for prospective students`
            : 'Enterprise admission lifecycle & CRM'
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
        <StatCard title="Leads" value={String(funnel.leads_total ?? '—')} icon={FiMessageSquare} />
        <StatCard title="Applications" value={String(funnel.applications_total ?? pipeline?.total ?? '—')} icon={FiFileText} />
        <StatCard title="Conversion %" value={String(funnel.conversion_rate ?? '—')} icon={FiPieChart} color="success" />
        <StatCard
          title="Seat Occupancy %"
          value={String(funnel.seat_occupancy?.occupancy_percent ?? '—')}
          icon={FiGrid}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Approved / Fee" value={String(funnel.approved ?? '—')} icon={FiUserCheck} />
        <StatCard title="Waitlisted" value={String(funnel.waitlisted ?? '—')} icon={FiClock} />
        <StatCard title="Rejected" value={String(funnel.rejected ?? '—')} icon={FiGitBranch} color="warning" />
        <StatCard
          title="Year / Modules"
          value={isYearActive ? `Active · ${enabledFeatures.length}` : 'Inactive'}
          icon={FiSettings}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {QUICK_LINKS.map(({ to, label, icon: Icon, desc }) => (
          <Link key={to} to={to}>
            <Card hover className="h-full">
              <div className="flex items-start gap-3 p-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{label}</p>
                  <p className="mt-0.5 text-xs font-normal text-muted-foreground">{desc}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
