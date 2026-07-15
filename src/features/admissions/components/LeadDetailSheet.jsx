import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { FiMail, FiPhone, FiUser, FiUserCheck, FiFileText } from 'react-icons/fi'
import { Sheet } from '@/components/ui/Sheet'
import Button from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Feedback'
import { StageBadge } from './StageBadge'
import { PriorityBadge } from './PriorityBadge'
import { ENQUIRY_SOURCE_LABELS, PIPELINE_STAGES } from '../types'
import { useAdmissionSetup } from '../hooks/useAdmissionSetup'

export function LeadDetailSheet({
  lead,
  open,
  onClose,
  onStageChange,
  onConvertLead,
}) {
  const { isFeatureEnabled } = useAdmissionSetup()

  if (!lead) return null

  const canConvert = isFeatureEnabled('conversion') && lead.stage !== 'lost'

  return (
    <Sheet open={open} onClose={onClose} title="Lead Details" maxWidth="xl">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Avatar name={lead.studentName} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground">{lead.studentName}</h3>
            <p className="text-sm text-muted-foreground">{lead.enquiryNumber}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StageBadge stage={lead.stage} />
              <PriorityBadge priority={lead.priority} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canConvert ? (
            <Button variant="primary" size="sm" onClick={() => onConvertLead?.(lead.id)}>
              <FiUserCheck className="h-4 w-4" />
              Convert to Application
            </Button>
          ) : null}
          <Link to={`/admissions/leads/${lead.id}/edit`}>
            <Button variant="outline" size="sm">
              <FiFileText className="h-4 w-4" />
              Edit Lead
            </Button>
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem icon={FiUser} label="Parent" value={lead.parentName} />
          <InfoItem icon={FiPhone} label="Phone" value={lead.phone} />
          <InfoItem icon={FiMail} label="Email" value={lead.email || '—'} />
          <InfoItem label="Grade" value={lead.gradeApplying} />
          <InfoItem label="Academic Year" value={lead.academicYear} />
          <InfoItem label="Source" value={ENQUIRY_SOURCE_LABELS[lead.source] || lead.source} />
          <InfoItem label="Assigned" value={lead.assignedTo} />
          <InfoItem label="Created" value={dayjs(lead.createdAt).format('MMM D, YYYY')} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Pipeline Stage</label>
          <select
            className="lms-select w-full"
            value={lead.stage}
            onChange={(e) => onStageChange?.(lead.id, e.target.value)}
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        {lead.activities?.length ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Recent Activity</h4>
            <div className="space-y-2">
              {lead.activities.map((activity) => (
                <div key={activity.id} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                  <p className="text-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {dayjs(activity.createdAt).format('MMM D, YYYY h:mm A')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Sheet>
  )
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
