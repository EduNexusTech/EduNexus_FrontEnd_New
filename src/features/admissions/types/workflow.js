/**
 * Canonical school admission ladder — single source of truth for UI workflow.
 *
 * Phase A (Lead CRM): enquiry → counselling → campus_visit
 * Phase B (Application): application_form → … → student_activated
 */
export const ADMISSION_LADDER = [
  {
    id: 'enquiry',
    label: 'Enquiry',
    phase: 'lead',
    description: 'Capture parent/student interest',
  },
  {
    id: 'counselling',
    label: 'Counselling',
    phase: 'lead',
    description: 'Counselor discusses programs, fees, and fit',
  },
  {
    id: 'campus_visit',
    label: 'Campus Visit',
    phase: 'lead',
    description: 'Schedule and complete school visit',
  },
  {
    id: 'application_form',
    label: 'Application Form',
    phase: 'application',
    description: 'Fill and submit the full admission application',
    statuses: ['lead', 'enquiry', 'application'],
  },
  {
    id: 'document_upload',
    label: 'Document Upload',
    phase: 'application',
    description: 'Upload required certificates and ID proofs',
    statuses: ['application', 'lead'],
  },
  {
    id: 'entrance_test_interview',
    label: 'Entrance Test / Interview',
    phase: 'application',
    description: 'Record entrance test and/or interview results',
    statuses: ['entrance_test', 'interview'],
  },
  {
    id: 'document_verification',
    label: 'Document Verification',
    phase: 'application',
    description: 'Verify all uploaded documents',
    statuses: ['documents'],
  },
  {
    id: 'application_approval',
    label: 'Application Approval',
    phase: 'application',
    description: 'Submit for approval and approve the application',
    statuses: ['approval'],
  },
  {
    id: 'fee_payment',
    label: 'Fee Payment',
    phase: 'application',
    description: 'Collect admission / confirmation fee',
    statuses: ['fee'],
  },
  {
    id: 'admission_confirmation',
    label: 'Admission Confirmation',
    phase: 'application',
    description: 'Confirm admission after fee is paid',
    statuses: ['confirmed', 'ready_for_sis'],
  },
  {
    id: 'admission_number',
    label: 'Admission Number',
    phase: 'application',
    description: 'Admission number is generated on approval',
    statuses: ['fee', 'confirmed', 'ready_for_sis', 'enrolled'],
  },
  {
    id: 'class_section_allocation',
    label: 'Class & Section Allocation',
    phase: 'application',
    description: 'Assign class section before activating the student',
    statuses: ['confirmed', 'ready_for_sis'],
  },
  {
    id: 'student_activated',
    label: 'Student Activated',
    phase: 'application',
    description: 'Create student/parent logins and activate in SIS',
    statuses: ['enrolled'],
  },
]

export const LEAD_CRM_STAGES = ADMISSION_LADDER.filter((s) => s.phase === 'lead').concat([
  { id: 'application', label: 'Application Form', phase: 'lead', description: 'Ready to fill application' },
  { id: 'lost', label: 'Closed', phase: 'lead', description: 'Enquiry closed / lost' },
])

/** Resolve which ladder step is current for an application record. */
export function resolveApplicationLadderStep(app) {
  if (!app) return 'application_form'
  const status = app.status
  const hasDocs = (app.documents || []).length > 0
  const allVerified =
    hasDocs && (app.documents || []).every((d) => d.verified)
  const hasAdmissionNo = Boolean(app.admission_number)
  const hasClassSection = Boolean(app.class_section || app.class_section_id)

  if (status === 'enrolled') return 'student_activated'
  if (status === 'confirmed' || status === 'ready_for_sis') {
    if (!hasClassSection) return 'class_section_allocation'
    if (hasAdmissionNo) return 'class_section_allocation'
    return 'admission_confirmation'
  }
  if (status === 'fee') {
    if (hasAdmissionNo) return 'fee_payment'
    return 'fee_payment'
  }
  if (status === 'approval') return 'application_approval'
  if (status === 'documents') return 'document_verification'
  if (status === 'entrance_test' || status === 'interview') return 'entrance_test_interview'
  if (status === 'application') {
    if (hasDocs && !allVerified) return 'document_upload'
    if (hasDocs && allVerified) return 'document_verification'
    return 'document_upload'
  }
  if (status === 'lead' || status === 'enquiry') return 'application_form'
  if (['rejected', 'withdrawn', 'cancelled'].includes(status)) return status
  return 'application_form'
}

export function ladderStepIndex(stepId) {
  return ADMISSION_LADDER.findIndex((s) => s.id === stepId)
}

export function isLadderStepDone(stepId, currentStepId, app) {
  const current = ladderStepIndex(currentStepId)
  const idx = ladderStepIndex(stepId)
  if (idx < 0 || current < 0) return false
  if (idx < current) return true
  // Special completions
  if (stepId === 'admission_number' && app?.admission_number) return true
  if (stepId === 'class_section_allocation' && (app?.class_section || app?.class_section_id)) {
    return current >= idx
  }
  if (stepId === 'student_activated' && app?.status === 'enrolled') return true
  return false
}
