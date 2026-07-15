import { FiInbox } from 'react-icons/fi'
import { AdmissionsTable } from './AdmissionsTable'
import { KanbanBoard } from './KanbanBoard'
import { TimelineView } from './TimelineView'

export function AdmissionsEmptyState({
  title = 'No records found',
  description = 'Try adjusting your filters or add a new enquiry.',
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <FiInbox className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function AdmissionsPagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {totalItems}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export function LeadsView({
  paginatedLeads,
  allFilteredLeads,
  loading,
  viewMode,
  page,
  totalPages,
  pageSize,
  onLeadClick,
  onPageChange,
  onStageChange,
  kanbanStages,
  showPagination = true,
  emptyTitle,
  emptyDescription,
}) {
  if (!loading && allFilteredLeads.length === 0) {
    return <AdmissionsEmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="space-y-4">
      {viewMode === 'table' ? (
        <>
          <AdmissionsTable leads={paginatedLeads} loading={loading} onLeadClick={onLeadClick} />
          {showPagination && !loading ? (
            <AdmissionsPagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              totalItems={allFilteredLeads.length}
              pageSize={pageSize}
            />
          ) : null}
        </>
      ) : null}

      {viewMode === 'kanban' ? (
        <KanbanBoard
          leads={allFilteredLeads}
          loading={loading}
          onLeadClick={onLeadClick}
          onStageChange={onStageChange}
          stages={kanbanStages}
        />
      ) : null}

      {viewMode === 'timeline' ? (
        <TimelineView leads={allFilteredLeads} loading={loading} onLeadClick={onLeadClick} />
      ) : null}
    </div>
  )
}
