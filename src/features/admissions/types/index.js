export const PIPELINE_STAGES = [
  { id: 'enquiry', label: 'Enquiry', color: 'bg-blue-500' },
  { id: 'counselling', label: 'Counselling', color: 'bg-cyan-500' },
  { id: 'campus_visit', label: 'Campus Visit', color: 'bg-indigo-500' },
  { id: 'application', label: 'Application Form', color: 'bg-amber-500' },
  { id: 'accepted', label: 'Fee / Review', color: 'bg-emerald-500' },
  { id: 'enrolled', label: 'Student Activated', color: 'bg-green-600' },
  { id: 'lost', label: 'Closed', color: 'bg-slate-400' },
]

export const STAGE_LABELS = Object.fromEntries(PIPELINE_STAGES.map((s) => [s.id, s.label]))

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

export const ENQUIRY_SOURCE_LABELS = {
  walk_in: 'Walk-in',
  website: 'Website',
  mobile_app: 'Mobile App',
  phone: 'Phone',
  email: 'Email',
  referral: 'Referral',
  campaign: 'Campaign',
  education_fair: 'Education Fair',
  social_media: 'Social Media / Google',
  import: 'Imported',
  other: 'Other',
}

export const ENQUIRY_STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  follow_up: 'Follow Up',
  visit_scheduled: 'Visit Scheduled',
  application_sent: 'Application Sent',
  converted: 'Converted',
  closed: 'Closed',
}

export const PARENT_RELATIONSHIP_LABELS = {
  father: 'Father',
  mother: 'Mother',
  guardian: 'Guardian',
}

export const GENDER_LABELS = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
}

export const GENDERS = ['male', 'female', 'other']

export const GRADES = [
  'Nursery',
  'LKG',
  'UKG',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
]

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Tamil Nadu',
  'Telangana',
  'Delhi',
  'Gujarat',
  'Rajasthan',
  'West Bengal',
]

export function enquiryStatusToStage(status) {
  const map = {
    contacted: 'counselling',
    counselling: 'counselling',
    follow_up: 'counselling',
    visit_scheduled: 'campus_visit',
    campus_visit: 'campus_visit',
    application_sent: 'application',
    converted: 'accepted',
    closed: 'lost',
  }
  return map[status] || 'enquiry'
}

/** UI pipeline stage → API lead.status */
export function stageToApiStatus(stage) {
  const map = {
    enquiry: 'new',
    counselling: 'counselling',
    campus_visit: 'campus_visit',
    application: 'application',
    // legacy UI ids
    contacted: 'counselling',
    qualified: 'counselling',
    interview: 'campus_visit',
    accepted: 'converted',
    enrolled: 'enrolled',
    lost: 'lost',
  }
  return map[stage] || 'new'
}

/** API lead.status → UI pipeline stage */
export function apiStatusToStage(status) {
  const map = {
    new: 'enquiry',
    counselling: 'counselling',
    campus_visit: 'campus_visit',
    application: 'application',
    contacted: 'counselling',
    qualified: 'counselling',
    interview: 'campus_visit',
    converted: 'accepted',
    enrolled: 'enrolled',
    lost: 'lost',
    lead: 'counselling',
    enquiry: 'enquiry',
  }
  return map[status] || 'enquiry'
}
