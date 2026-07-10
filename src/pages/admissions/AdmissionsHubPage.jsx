import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { FiClipboard, FiUserPlus, FiUsers } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Feedback'
import { admissionService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { ADMISSION_STATUS_OPTIONS } from '@/config/constants'

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

  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'Admissions' }]} />
      <PageHeader
        title="Admissions"
        subtitle="Enterprise admission workflow — enquiry to enrollment"
        actions={
          <>
            <Link to="/admissions/leads/new"><Button variant="secondary"><FiUserPlus /> New Lead</Button></Link>
            <Link to="/admissions/applications/new"><Button><FiClipboard /> New Application</Button></Link>
          </>
        }
      />

      {statsQuery.isLoading ? <PageLoader /> : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <Card className="col-span-2 lg:col-span-1">
            <p className="text-xs font-medium uppercase text-muted">Total</p>
            <p className="mt-1 text-2xl font-bold text-text">{stats?.total ?? 0}</p>
          </Card>
          {ADMISSION_STATUS_OPTIONS.slice(0, 5).map((s) => (
            <Card key={s.value}>
              <p className="text-xs font-medium text-muted truncate">{s.label}</p>
              <p className="mt-1 text-xl font-semibold text-text">{byStatus[s.value] ?? 0}</p>
            </Card>
          ))}
        </div>
      )}

      {statsQuery.error && (
        <p className="mb-6 text-sm text-danger">{getErrorMessage(statsQuery.error)}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.path} to={item.path}>
              <Card className="h-full transition hover:border-primary/30 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-text">{item.label}</p>
                    <p className="mt-1 text-sm text-muted">{item.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
