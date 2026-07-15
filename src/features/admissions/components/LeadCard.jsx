import dayjs from 'dayjs'
import { FiCalendar, FiMail, FiPhone, FiUser } from 'react-icons/fi'
import { Card, CardContent } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Feedback'
import { StageBadge } from './StageBadge'
import { PriorityBadge } from './PriorityBadge'
import { ENQUIRY_SOURCE_LABELS } from '../types'

export function LeadCard({ lead, onClick, compact }) {
  return (
    <Card
      padding={false}
      hover
      className="cursor-pointer"
      onClick={() => onClick(lead)}
    >
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start gap-3">
          <Avatar name={lead.studentName} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{lead.studentName}</p>
                <p className="truncate text-xs text-muted-foreground">{lead.enquiryNumber}</p>
              </div>
              <PriorityBadge priority={lead.priority} />
            </div>

            {!compact ? (
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <FiUser className="h-3 w-3" />
                  {lead.parentName}
                </p>
                {lead.email ? (
                  <p className="flex items-center gap-1.5">
                    <FiMail className="h-3 w-3" />
                    {lead.email}
                  </p>
                ) : null}
                <p className="flex items-center gap-1.5">
                  <FiPhone className="h-3 w-3" />
                  {lead.phone}
                </p>
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StageBadge stage={lead.stage} />
              <span className="rounded-md bg-muted px-2 py-0.5 text-xs">{lead.gradeApplying}</span>
              <span className="text-xs text-muted-foreground">
                {ENQUIRY_SOURCE_LABELS[lead.source] || lead.source}
              </span>
            </div>

            {lead.nextFollowUp && !compact ? (
              <p className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                <FiCalendar className="h-3 w-3" />
                Follow-up: {dayjs(lead.nextFollowUp).format('MMM D, YYYY')}
              </p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
