import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiClipboard, FiUserPlus, FiUsers } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Feedback'
import { admissionService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { ADMISSION_STATUS_OPTIONS } from '@/config/constants'
import { HubPageShell, HubStatGrid, HubLinkCard } from '@/components/hub/HubWidgets'

const QUICK_LINKS = [
  { label: 'Admission Leads', path: '/admissions/leads', icon: FiUserPlus, desc: 'Enquiries & lead management' },
  { label: 'Applications', path: '/admissions/applications', icon: FiClipboard, desc: 'Full admission pipeline' },
  { label: 'School Users', path: '/school-users', icon: FiUsers, desc: 'Students & parents after enrollment' },
]

export default function AdmissionsHubPage() {
  const statsQuery = useQuery({
    queryKey: ['admissions', 'pipeline-stats'],
    queryFn: () => admissionService.applications.pipelineStats(),
  })

  const stats = unwrapData(statsQuery.data)
  const byStatus = stats?.by_status || {}

  const statItems = [
    { label: 'Total', value: stats?.total ?? 0, className: 'col-span-2 lg:col-span-1' },
    ...ADMISSION_STATUS_OPTIONS.slice(0, 5).map((s) => ({
      label: s.label,
      value: byStatus[s.value] ?? 0,
    })),
  ]

  return (
    <HubPageShell>
      <Breadcrumb items={[{ label: 'Admissions' }]} />
      <PageHeader
        title="Admissions"
        subtitle="Enterprise admission workflow — enquiry to enrollment"
        actions={
          <>
            <Link to="/admissions/leads/new"><Button variant="create"><FiUserPlus /> New Lead</Button></Link>
            <Link to="/admissions/applications/new"><Button variant="create"><FiClipboard /> New Application</Button></Link>
          </>
        }
      />

      {statsQuery.isLoading ? <PageLoader /> : <HubStatGrid stats={statItems} />}

      {statsQuery.error && (
        <p className="mb-6 text-sm text-danger">{getErrorMessage(statsQuery.error)}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {QUICK_LINKS.map((item) => (
          <HubLinkCard key={item.path} to={item.path} icon={item.icon} label={item.label} description={item.desc} />
        ))}
      </div>
    </HubPageShell>
  )
}
