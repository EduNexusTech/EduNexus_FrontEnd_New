import { Link } from 'react-router-dom'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader } from '@/components/ui/Card'
import { MAIN_REPORT_LINKS } from '@/config/reportDefinitions'

export default function ReportsHubPage() {
  const grouped = MAIN_REPORT_LINKS.reduce((acc, report) => {
    const key = report.module || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(report)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Reports' }]} />
      <PageHeader
        title="Reports"
        description="School-wide analytics and registers across students, fees, and attendance"
      />
      {Object.entries(grouped).map(([module, reports]) => (
        <div key={module} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{module}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                to={report.path}
                className="rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
              >
                <p className="font-semibold text-foreground">{report.label}</p>
                <p className="mt-1 text-sm text-muted">{report.desc}</p>
                <p className="mt-3 text-sm font-medium text-primary">Open report →</p>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
