import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { FiPlus } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { PageHeader } from '@/components/common/PageHeader'
import { AdmissionsSubNav } from '@/features/admissions/components/AdmissionsSubNav'
import { AcademicYearSelector } from '@/features/admissions/components/AcademicYearSelector'
import { AdmissionsPageShell } from '@/features/admissions/components/AdmissionsPageShell'
import { AdmissionsToolbar } from '@/features/admissions/components/AdmissionsToolbar'
import { AdmissionsFiltersPanel } from '@/features/admissions/components/AdmissionsFilters'
import { LeadsView } from '@/features/admissions/components/LeadsView'
import { EnquiryFormSheet } from '@/features/admissions/components/EnquiryFormSheet'
import { useAdmissions } from '@/features/admissions/hooks/useAdmissions'
import { useAdmissionSetup } from '@/features/admissions/hooks/useAdmissionSetup'
import ModulePage from '@/components/common/ModulePage'

function AdmissionFeatureGuard({ feature, children }) {
  const { isFeatureEnabled, isYearActive, currentYear } = useAdmissionSetup()
  if (!currentYear) {
    return (
      <ModulePage
        hideHeader
        showToolbar={false}
        emptyTitle="Select an academic year"
        emptyDescription="Choose an academic year from the header to use admission modules."
        actions={null}
      />
    )
  }
  if (!isYearActive) {
    return (
      <ModulePage
        hideHeader
        showToolbar={false}
        emptyTitle={`${currentYear.label} is inactive`}
        emptyDescription="Activate this academic year in Admission Setup to use admission modules."
        actions={
          <Link to="/admissions/setup">
            <Button variant="primary">Open Setup</Button>
          </Link>
        }
      />
    )
  }
  if (feature && !isFeatureEnabled(feature)) {
    return (
      <ModulePage
        hideHeader
        showToolbar={false}
        emptyTitle="Module disabled"
        emptyDescription="Enable this module for the selected academic year in Admission Setup."
        actions={
          <Link to="/admissions/setup">
            <Button variant="primary">Open Setup</Button>
          </Link>
        }
      />
    )
  }
  return children
}

export function EnquiriesPage() {
  const admissions = useAdmissions({ excludeStages: ['enrolled', 'lost'] })
  const { currentYear, isFeatureEnabled } = useAdmissionSetup()
  const [enquiryFormOpen, setEnquiryFormOpen] = useState(false)

  const canAddEnquiry = isFeatureEnabled('enquiry')
  const canSendAppLink =
    isFeatureEnabled('onlineAdmissionForm') && isFeatureEnabled('externalApplication')

  const handleEnquirySubmit = async (values) => {
    await admissions.addEnquiry(values)
    setEnquiryFormOpen(false)
  }

  return (
    <AdmissionsPageShell
      title="Enquiry Management"
      description="Capture, track, and nurture admission enquiries from all sources"
      actions={
        canAddEnquiry ? (
          <Button variant="create" onClick={() => setEnquiryFormOpen(true)}>
            <FiPlus className="h-4 w-4" />
            Add Enquiry
          </Button>
        ) : null
      }
      {...admissions.leadSheetProps}
    >
      <AdmissionFeatureGuard feature="enquiry">
        <div className="space-y-4">
          <AdmissionsToolbar
            search={admissions.filters.search}
            onSearchChange={(v) => admissions.updateFilters({ search: v })}
            viewMode={admissions.viewMode}
            onViewModeChange={admissions.setViewMode}
            resultCount={admissions.filteredLeads.length}
            addLabel="Add Enquiry"
            onAddNew={canAddEnquiry ? () => setEnquiryFormOpen(true) : undefined}
          />
          <AdmissionsFiltersPanel
            filters={admissions.filters}
            onChange={admissions.updateFilters}
            onReset={admissions.resetFilters}
            hideStage
          />
          <LeadsView
            paginatedLeads={admissions.paginatedLeads}
            allFilteredLeads={admissions.filteredLeads}
            loading={admissions.loading}
            viewMode={admissions.viewMode}
            page={admissions.page}
            totalPages={admissions.totalPages}
            pageSize={admissions.pageSize}
            onLeadClick={admissions.setSelectedLead}
            onPageChange={admissions.setPage}
            emptyTitle="No enquiries found"
            emptyDescription="No enquiries match your current filters. Try broadening your search or add a new enquiry."
          />
        </div>
      </AdmissionFeatureGuard>

      {canAddEnquiry ? (
        <EnquiryFormSheet
          open={enquiryFormOpen}
          onClose={() => setEnquiryFormOpen(false)}
          defaultAcademicYear={currentYear?.label ?? '2026-27'}
          sendApplicationLinkOnSave={canSendAppLink}
          onSubmit={handleEnquirySubmit}
          loading={admissions.creating}
        />
      ) : null}
    </AdmissionsPageShell>
  )
}

export function PipelinePage() {
  const admissions = useAdmissions({ initialViewMode: 'kanban' })
  const pipelineLeads = admissions.filteredLeads.filter((l) => l.stage !== 'lost')

  return (
    <AdmissionsPageShell
      title="Lead Pipeline"
      description="Visual kanban pipeline from enquiry to enrollment"
      {...admissions.leadSheetProps}
    >
      <AdmissionFeatureGuard feature="enquiry">
        <div className="space-y-4">
          <AdmissionsToolbar
            search={admissions.filters.search}
            onSearchChange={(v) => admissions.updateFilters({ search: v })}
            viewMode={admissions.viewMode}
            onViewModeChange={admissions.setViewMode}
            resultCount={pipelineLeads.length}
          />
          <AdmissionsFiltersPanel
            filters={admissions.filters}
            onChange={admissions.updateFilters}
            onReset={admissions.resetFilters}
          />
          <LeadsView
            paginatedLeads={admissions.paginatedLeads}
            allFilteredLeads={pipelineLeads}
            loading={admissions.loading}
            viewMode={admissions.viewMode}
            page={admissions.page}
            totalPages={admissions.totalPages}
            pageSize={admissions.pageSize}
            onLeadClick={admissions.setSelectedLead}
            onPageChange={admissions.setPage}
            onStageChange={admissions.updateLeadStage}
            kanbanStages={['enquiry', 'contacted', 'qualified', 'application', 'interview', 'accepted', 'enrolled']}
            emptyTitle="Pipeline is empty"
            emptyDescription="No leads in the pipeline. Add enquiries to start building your funnel."
          />
        </div>
      </AdmissionFeatureGuard>
    </AdmissionsPageShell>
  )
}

export function FollowUpsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Scheduled follow-up tasks for admission leads"
        actions={<AcademicYearSelector />}
      />
      <AdmissionsSubNav />
      <AdmissionFeatureGuard feature="followUps">
        <ModulePage
          hideHeader
          searchPlaceholder="Search follow-ups..."
          actions={null}
          emptyTitle="No follow-ups yet"
          emptyDescription="Schedule and track follow-up calls and visits for enquiries."
        />
      </AdmissionFeatureGuard>
    </div>
  )
}

export function InternalApplicationsPage() {
  const admissions = useAdmissions({
    initialApplicationType: 'internal',
    excludeStages: ['lost'],
  })

  return (
    <AdmissionsPageShell
      title="Internal Applications"
      description="In-house student application processing"
      actions={
        <Link to="/admissions/applications/new">
          <Button variant="create">
            <FiPlus className="h-4 w-4" />
            New Application
          </Button>
        </Link>
      }
      {...admissions.leadSheetProps}
    >
      <AdmissionFeatureGuard feature="internalApplication">
        <div className="space-y-4">
          <AdmissionsToolbar
            search={admissions.filters.search}
            onSearchChange={(v) => admissions.updateFilters({ search: v })}
            viewMode={admissions.viewMode === 'kanban' ? 'table' : admissions.viewMode}
            onViewModeChange={admissions.setViewMode}
            resultCount={admissions.filteredLeads.length}
            viewModes={['table', 'timeline']}
          />
          <LeadsView
            paginatedLeads={admissions.paginatedLeads}
            allFilteredLeads={admissions.filteredLeads}
            loading={admissions.loading}
            viewMode={admissions.viewMode === 'kanban' ? 'table' : admissions.viewMode}
            page={admissions.page}
            totalPages={admissions.totalPages}
            pageSize={admissions.pageSize}
            onLeadClick={admissions.setSelectedLead}
            onPageChange={admissions.setPage}
            emptyTitle="No internal applications"
            emptyDescription="Open a lead from enquiries and use Convert to Application, or create a new application."
          />
        </div>
      </AdmissionFeatureGuard>
    </AdmissionsPageShell>
  )
}

export function ExternalApplicationsPage() {
  const admissions = useAdmissions({ excludeStages: ['enrolled', 'lost'] })

  return (
    <AdmissionsPageShell
      title="External Applications"
      description="Online and transfer student applications"
      {...admissions.leadSheetProps}
    >
      <AdmissionFeatureGuard feature="externalApplication">
        <div className="space-y-4">
          <AdmissionsToolbar
            search={admissions.filters.search}
            onSearchChange={(v) => admissions.updateFilters({ search: v })}
            viewMode={admissions.viewMode === 'kanban' ? 'table' : admissions.viewMode}
            onViewModeChange={admissions.setViewMode}
            resultCount={admissions.filteredLeads.length}
            viewModes={['table', 'timeline']}
          />
          <LeadsView
            paginatedLeads={admissions.paginatedLeads}
            allFilteredLeads={admissions.filteredLeads}
            loading={admissions.loading}
            viewMode={admissions.viewMode === 'kanban' ? 'table' : admissions.viewMode}
            page={admissions.page}
            totalPages={admissions.totalPages}
            pageSize={admissions.pageSize}
            onLeadClick={admissions.setSelectedLead}
            onPageChange={admissions.setPage}
            emptyTitle="No external applications"
            emptyDescription="Public online applications for the selected academic year will appear here."
          />
        </div>
      </AdmissionFeatureGuard>
    </AdmissionsPageShell>
  )
}

export function ConversionPage() {
  const admissions = useAdmissions({ excludeStages: ['lost'] })
  const ready = admissions.filteredLeads.filter((l) => ['accepted', 'enrolled', 'application'].includes(l.stage))

  return (
    <AdmissionsPageShell
      title="Student Conversion"
      description="Convert accepted applicants into enrolled students"
      {...admissions.leadSheetProps}
    >
      <AdmissionFeatureGuard feature="conversion">
        <div className="space-y-4">
          <AdmissionsToolbar
            search={admissions.filters.search}
            onSearchChange={(v) => admissions.updateFilters({ search: v })}
            viewMode={admissions.viewMode}
            onViewModeChange={admissions.setViewMode}
            resultCount={ready.length}
            viewModes={['table', 'kanban', 'timeline']}
          />
          <LeadsView
            paginatedLeads={ready.slice((admissions.page - 1) * admissions.pageSize, admissions.page * admissions.pageSize)}
            allFilteredLeads={ready}
            loading={admissions.loading}
            viewMode={admissions.viewMode}
            page={admissions.page}
            totalPages={Math.max(1, Math.ceil(ready.length / admissions.pageSize))}
            pageSize={admissions.pageSize}
            onLeadClick={admissions.setSelectedLead}
            onPageChange={admissions.setPage}
            onStageChange={admissions.updateLeadStage}
            emptyTitle="Ready for conversion"
            emptyDescription="Accepted applications can be converted to student records from the lead detail drawer."
          />
        </div>
      </AdmissionFeatureGuard>
    </AdmissionsPageShell>
  )
}

export function AdmissionsLeadsRedirect() {
  return <Navigate to="/admissions/enquiries" replace />
}

export function AdmissionsApplicationsRedirect() {
  return <Navigate to="/admissions/applications/internal" replace />
}
