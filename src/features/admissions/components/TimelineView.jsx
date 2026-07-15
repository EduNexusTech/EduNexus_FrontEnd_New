import dayjs from 'dayjs'
import { FiActivity } from 'react-icons/fi'
import { StageBadge } from './StageBadge'

export function TimelineView({ leads, loading, onLeadClick }) {
  if (loading) {
    return <div className="h-40 animate-pulse rounded-xl bg-muted" />
  }

  const events = leads
    .flatMap((lead) =>
      (lead.activities || []).map((activity) => ({
        ...activity,
        lead,
      })),
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  if (!events.length) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        No activity yet for the selected filters.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <button
          key={`${event.lead.id}-${event.id}`}
          type="button"
          onClick={() => onLeadClick(event.lead)}
          className="flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <FiActivity className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground">{event.lead.studentName}</p>
              <StageBadge stage={event.lead.stage} />
            </div>
            <p className="mt-1 text-sm text-foreground">{event.description}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {dayjs(event.createdAt).format('MMM D, YYYY h:mm A')} · {event.user}
            </p>
          </div>
        </button>
      ))}
    </div>
  )
}
