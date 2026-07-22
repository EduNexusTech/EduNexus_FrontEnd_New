import { Link, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { FiMail, FiPhone, FiUser, FiFileText, FiEdit3, FiCheckCircle, FiEye } from 'react-icons/fi'
import { Sheet } from '@/components/ui/Sheet'
import Button from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Feedback'
import { StageBadge } from './StageBadge'
import { PriorityBadge } from './PriorityBadge'
import { ENQUIRY_SOURCE_LABELS, PIPELINE_STAGES } from '../types'
import { ADMISSION_LADDER } from '../types/workflow'
import { useAdmissionSetup } from '../hooks/useAdmissionSetup'

export function LeadDetailSheet({
  lead,
  open,
  onClose,
  onStageChange,
  onConvertLead,
  converting,
}) {
  const navigate = useNavigate()
  const { isFeatureEnabled } = useAdmissionSetup()

  if (!lead) return null

  const hasApplication = Boolean(lead.convertedApplicationId)
  const formStatus = lead.applicationFormStatus || (hasApplication ? 'draft' : 'not_started')
  const isFormFilled = formStatus === 'filled'
  const isFormDraft = formStatus === 'draft'
  const canStartApplication =
    isFeatureEnabled('internalApplication') ||
    isFeatureEnabled('externalApplication') ||
    isFeatureEnabled('conversion')
  const showApplicationActions = canStartApplication && lead.stage !== 'lost'
  const readyForApplication = ['campus_visit', 'application', 'accepted'].includes(lead.stage)

  const handleFillApplication = async () => {
    if (isFormFilled) {
      onClose?.()
      navigate(`/admissions/applications/${lead.convertedApplicationId}`)
      return
    }
    // Sync/create then open editor for draft / new applications
    const application = await onConvertLead?.(lead.id)
    const appId =
      application?.application_id ||
      application?.id ||
      lead.convertedApplicationId
    if (appId) {
      onClose?.()
      navigate(`/admissions/applications/${appId}/edit`)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Lead Details" maxWidth="xl">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <Avatar name={lead.studentName} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-foreground">{lead.studentName}</h3>
            <p className="text-sm font-normal text-muted-foreground">{lead.enquiryNumber}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StageBadge stage={lead.stage} />
              <PriorityBadge priority={lead.priority} />
              {isFormFilled ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  <FiCheckCircle className="h-3.5 w-3.5" />
                  Application filled
                </span>
              ) : null}
              {isFormDraft ? (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  Application draft
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Admission ladder (CRM phase)
          </p>
          <ol className="mt-2 grid gap-1 sm:grid-cols-3">
            {ADMISSION_LADDER.filter((s) => s.phase === 'lead').map((step) => {
              const active =
                (step.id === 'enquiry' && lead.stage === 'enquiry') ||
                (step.id === 'counselling' && lead.stage === 'counselling') ||
                (step.id === 'campus_visit' && lead.stage === 'campus_visit') ||
                (step.id === 'application_form' && (isFormDraft || isFormFilled || lead.stage === 'application'))
              const done =
                (step.id === 'application_form' && isFormFilled) ||
                (step.id === 'enquiry' && lead.stage !== 'enquiry')
              return (
                <li
                  key={step.id}
                  className={`rounded-md px-2 py-1.5 text-xs ${
                    done
                      ? 'bg-emerald-50 font-medium text-emerald-800'
                      : active
                        ? 'bg-brand-50 font-medium text-brand-800'
                        : 'text-muted-foreground'
                  }`}
                >
                  {step.id === 'application_form' && isFormFilled
                    ? 'Application Form — Filled'
                    : step.label}
                </li>
              )
            })}
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          {showApplicationActions && !isFormFilled ? (
            <Button
              variant="primary"
              size="sm"
              loading={converting}
              onClick={handleFillApplication}
            >
              {isFormDraft ? (
                <>
                  <FiEdit3 className="h-4 w-4" />
                  Continue Application Form
                </>
              ) : (
                <>
                  <FiFileText className="h-4 w-4" />
                  Fill Application Form
                </>
              )}
            </Button>
          ) : null}

          {isFormFilled ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-900">
                <FiCheckCircle className="h-4 w-4" />
                Application filled
                {lead.convertedApplicationNumber
                  ? ` · ${lead.convertedApplicationNumber}`
                  : ''}
              </span>
              <Link to={`/admissions/applications/${lead.convertedApplicationId}`}>
                <Button variant="primary" size="sm">
                  <FiEye className="h-4 w-4" />
                  View Application
                </Button>
              </Link>
            </>
          ) : null}

          {hasApplication ? (
            <Link to={`/admissions/applications/${lead.convertedApplicationId}`}>
              <Button variant="outline" size="sm">
                Continue Admission Workflow
              </Button>
            </Link>
          ) : null}

          <Link to={`/admissions/leads/${lead.id}/edit`}>
            <Button variant="outline" size="sm">
              Edit Lead
            </Button>
          </Link>
        </div>

        {isFormFilled ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-normal text-emerald-900">
            Application form is already submitted. Use <strong>View Application</strong> to see
            full details, or continue the admission workflow (documents, test, fee, enrollment).
          </div>
        ) : null}

        {!hasApplication && readyForApplication && showApplicationActions ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-normal text-amber-900">
            After campus visit, use <strong>Fill Application Form</strong> to continue:
            documents → test/interview → approval → fee → confirmation → class allocation → student
            activation.
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoItem icon={FiUser} label="Parent" value={lead.parentName} />
          <InfoItem icon={FiPhone} label="Phone" value={lead.phone} />
          <InfoItem icon={FiMail} label="Email" value={lead.email || '—'} />
          <InfoItem label="Grade" value={lead.gradeApplying} />
          <InfoItem label="Academic Year" value={lead.academicYear} />
          <InfoItem label="Source" value={ENQUIRY_SOURCE_LABELS[lead.source] || lead.source} />
          <InfoItem label="Assigned" value={lead.assignedTo} />
          <InfoItem label="Created" value={dayjs(lead.createdAt).format('MMM D, YYYY')} />
          <InfoItem
            label="Application form"
            value={
              isFormFilled
                ? 'Filled'
                : isFormDraft
                  ? 'Draft (in progress)'
                  : 'Not started'
            }
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">CRM Stage</label>
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
