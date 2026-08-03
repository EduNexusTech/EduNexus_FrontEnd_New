import dayjs from 'dayjs'
import { apiStatusToStage, stageToApiStatus } from '../types'

export function apiLeadToUi(row) {
  if (!row) return null
  const id = String(row.lead_id ?? row.id ?? '')
  return {
    id,
    enquiryNumber: row.enquiry_number || row.lead_number || `ENQ-${id.slice(0, 8)}`,
    studentName: row.student_name || '—',
    dateOfBirth: row.date_of_birth || '',
    gender: row.gender || '',
    parentName: row.parent_name || '—',
    parentRelationship: row.parent_relationship || 'father',
    email: row.email || '',
    phone: row.mobile_number || row.phone || '',
    city: row.city || '',
    state: row.state || '',
    currentSchool: row.current_school || '',
    gradeApplying:
      row.grade_applying || row.class_name || row.interested_class_name || row.applied_class_name || '—',
    academicYear: row.academic_year_name || row.academic_year_label || row.academic_year || '—',
    academicYearId: row.academic_year_id || null,
    source: row.source || 'other',
    enquiryStatus: row.status || 'new',
    stage: apiStatusToStage(row.status || row.pipeline_stage || 'new'),
    applicationType: row.application_type || null,
    applicationStatus: row.application_status || 'not_started',
    priority: row.priority || 'medium',
    assignedTo: row.assigned_to_name || 'Unassigned',
    assignedToId: row.assigned_to ? String(row.assigned_to) : null,
    createdAt: row.created_at || row.enquiry_date || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at,
    nextFollowUp: row.next_follow_up,
    notes: row.notes || [],
    activities: buildActivities(row),
    tags: row.tags || [],
    convertedStudentId: row.converted_student_id,
    convertedApplicationId: row.converted_application_id
      ? String(row.converted_application_id)
      : null,
    applicationFormStatus: row.application_form_status || (
      row.converted_application_id
        ? (row.converted_application_is_draft === false ||
          (row.converted_application_status && !['lead', 'enquiry'].includes(row.converted_application_status))
          ? 'filled'
          : 'draft')
        : 'not_started'
    ),
    convertedApplicationIsDraft: row.converted_application_is_draft,
    convertedApplicationStatus: row.converted_application_status || null,
    convertedApplicationNumber: row.converted_application_number || null,
    _raw: row,
  }
}

function buildActivities(row) {
  const items = []
  if (row.created_at || row.enquiry_date) {
    items.push({
      id: 'created',
      type: 'status_change',
      description: 'Enquiry created',
      user: 'System',
      createdAt: row.created_at || row.enquiry_date,
    })
  }
  if (row.status) {
    items.push({
      id: 'status',
      type: 'status_change',
      description: `Status: ${row.status}`,
      user: 'System',
      createdAt: row.updated_at || row.created_at,
    })
  }
  return items
}

export function enquiryFormToApi(values, options = {}) {
  const academicYearId = options.academicYearId || values.academicYearId || null
  const payload = {
    student_name: values.studentName.trim(),
    parent_name: values.parentName.trim(),
    parent_relationship: values.parentRelationship || 'father',
    email: values.email?.trim() || '',
    mobile_number: values.phone.trim(),
    date_of_birth: values.dateOfBirth || null,
    gender: values.gender || '',
    city: values.city?.trim() || '',
    state: values.state || '',
    current_school: values.currentSchool?.trim() || '',
    grade_applying: values.gradeApplying || '',
    source: values.source || 'website',
    status: stageToApiStatus(enquiryStatusToStage(values.enquiryStatus || 'new')),
    priority: values.priority || 'medium',
    application_type: values.applicationType || 'internal',
    enquiry_date: dayjs().format('YYYY-MM-DD'),
    notes: values.notes?.trim?.() || '',
  }
  if (academicYearId) {
    payload.academic_year_id = academicYearId
  }
  // Backend expects a user UUID (or omit); never send display names.
  if (values.assignedTo) {
    payload.assigned_to = values.assignedTo
  }
  return payload
}

function enquiryStatusToStage(status) {
  const map = {
    contacted: 'contacted',
    follow_up: 'qualified',
    visit_scheduled: 'interview',
    application_sent: 'application',
    converted: 'accepted',
    closed: 'lost',
  }
  return map[status] || 'enquiry'
}

export function stageChangeToApi(stage) {
  return { status: stageToApiStatus(stage) }
}

export function apiSetupToUi(row) {
  if (!row) return null
  // Lazy import avoided — features defaults filled by caller hook when needed
  const features = { ...(row.features || {}) }
  return {
    id: String(row.setup_id ?? row.id ?? ''),
    academicYearId: row.academic_year_id ? String(row.academic_year_id) : null,
    label: row.label || row.name || '',
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    status: row.status || (row.is_active ? 'active' : 'inactive'),
    isCurrent: Boolean(row.is_current),
    features,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    _raw: row,
  }
}

export function setupFormToApi(values, { schoolId } = {}) {
  return {
    label: values.label?.trim(),
    start_date: values.startDate,
    end_date: values.endDate,
    is_current: Boolean(values.isCurrent),
    status: values.status || 'inactive',
    features: values.features || {},
    ...(schoolId ? { school_id: schoolId } : {}),
  }
}
