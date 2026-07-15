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
    gradeApplying: row.grade_applying || row.class_name || row.applied_class_name || '—',
    academicYear: row.academic_year || row.academic_year_label || '—',
    source: row.source || 'other',
    enquiryStatus: row.status || 'new',
    stage: apiStatusToStage(row.status || row.pipeline_stage || 'new'),
    applicationType: row.application_type || null,
    applicationStatus: row.application_status || 'not_started',
    priority: row.priority || 'medium',
    assignedTo: row.assigned_to_name || row.assigned_to || 'Admissions Team',
    createdAt: row.created_at || row.enquiry_date || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at,
    nextFollowUp: row.next_follow_up,
    notes: row.notes || [],
    activities: buildActivities(row),
    tags: row.tags || [],
    convertedStudentId: row.converted_student_id,
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

export function enquiryFormToApi(values) {
  const notes = [
    values.currentSchool ? `Current school: ${values.currentSchool}` : null,
    values.city || values.state ? `Location: ${[values.city, values.state].filter(Boolean).join(', ')}` : null,
    values.dateOfBirth ? `DOB: ${values.dateOfBirth}` : null,
    values.gender ? `Gender: ${values.gender}` : null,
    values.gradeApplying ? `Grade: ${values.gradeApplying}` : null,
    values.academicYear ? `Academic year: ${values.academicYear}` : null,
    values.assignedTo ? `Assigned: ${values.assignedTo}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    student_name: values.studentName.trim(),
    parent_name: values.parentName.trim(),
    email: values.email?.trim() || '',
    mobile_number: values.phone.trim(),
    source: values.source || 'website',
    status: stageToApiStatus(enquiryStatusToStage(values.enquiryStatus || 'new')),
    notes: notes || undefined,
    enquiry_date: dayjs().format('YYYY-MM-DD'),
  }
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
