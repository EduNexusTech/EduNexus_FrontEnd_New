import dayjs from 'dayjs'
import { Avatar } from '@/components/ui/Feedback'
import { StageBadge } from './StageBadge'
import { PriorityBadge } from './PriorityBadge'
import { ENQUIRY_SOURCE_LABELS } from '../types'

export function AdmissionsTable({ leads, loading, onLeadClick }) {
  if (loading) {
    return (
      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (!leads.length) return null

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3">Student</th>
            <th className="hidden px-4 py-3 md:table-cell">Parent</th>
            <th className="hidden px-4 py-3 lg:table-cell">Grade</th>
            <th className="hidden px-4 py-3 sm:table-cell">Source</th>
            <th className="px-4 py-3">Stage</th>
            <th className="px-4 py-3">Application</th>
            <th className="hidden px-4 py-3 md:table-cell">Priority</th>
            <th className="hidden px-4 py-3 lg:table-cell">Assigned</th>
            <th className="hidden px-4 py-3 xl:table-cell">Created</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr
              key={lead.id}
              className="cursor-pointer border-b border-border/60 transition-colors hover:bg-muted/40"
              onClick={() => onLeadClick(lead)}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={lead.studentName} size="sm" />
                  <div>
                    <p className="font-medium text-foreground">{lead.studentName}</p>
                    <p className="text-xs text-muted-foreground">{lead.enquiryNumber}</p>
                  </div>
                </div>
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{lead.parentName}</td>
              <td className="hidden px-4 py-3 lg:table-cell">{lead.gradeApplying}</td>
              <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {ENQUIRY_SOURCE_LABELS[lead.source] || lead.source}
              </td>
              <td className="px-4 py-3">
                <StageBadge stage={lead.stage} />
              </td>
              <td className="px-4 py-3">
                {lead.applicationFormStatus === 'filled' ? (
                  <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Application filled
                  </span>
                ) : lead.applicationFormStatus === 'draft' ? (
                  <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                    Draft
                  </span>
                ) : (
                  <span className="text-xs font-normal text-muted-foreground">Not started</span>
                )}
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <PriorityBadge priority={lead.priority} />
              </td>
              <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{lead.assignedTo}</td>
              <td className="hidden px-4 py-3 text-muted-foreground xl:table-cell">
                {dayjs(lead.createdAt).format('MMM D, YYYY')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
