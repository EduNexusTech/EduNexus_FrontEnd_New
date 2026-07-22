import { PageHeader } from '@/components/common/PageHeader'
import { AdmissionsSubNav } from './AdmissionsSubNav'
import { AcademicYearSelector } from './AcademicYearSelector'
import { LeadDetailSheet } from './LeadDetailSheet'

export function AdmissionsPageShell({
  title,
  description,
  actions,
  children,
  selectedLead,
  onCloseLead,
  onStageChange,
  onConvertLead,
  converting,
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AcademicYearSelector />
            {actions}
          </div>
        }
      />
      <AdmissionsSubNav />
      {children}
      <LeadDetailSheet
        lead={selectedLead}
        open={Boolean(selectedLead)}
        onClose={onCloseLead}
        onStageChange={onStageChange}
        onConvertLead={onConvertLead}
        converting={converting}
      />
    </div>
  )
}
