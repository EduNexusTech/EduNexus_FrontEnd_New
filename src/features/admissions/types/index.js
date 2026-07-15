export const PIPELINE_STAGES = [
  { id: 'enquiry', label: 'Enquiry', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-cyan-500' },
  { id: 'qualified', label: 'Follow-up', color: 'bg-indigo-500' },
  { id: 'application', label: 'Application', color: 'bg-amber-500' },
  { id: 'interview', label: 'Visit', color: 'bg-purple-500' },
  { id: 'accepted', label: 'Fee / Review', color: 'bg-emerald-500' },
  { id: 'enrolled', label: 'Enrolled', color: 'bg-green-600' },
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
  website: 'Website',
  google: 'Google Search',
  facebook: 'Facebook',
  instagram: 'Instagram',
  newspaper: 'Newspaper',
  existing_parent: 'Existing Parent',
  friend_relative: 'Friend / Relative',
  walk_in: 'Walk-in',
  referral: 'Referral',
  campaign: 'Campaign',
  phone: 'Phone',
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

export const ASSIGNEES = ['Admissions Team', 'Counsellor A', 'Counsellor B', 'Front Desk']

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
    contacted: 'contacted',
    follow_up: 'qualified',
    visit_scheduled: 'interview',
    application_sent: 'application',
    converted: 'accepted',
    closed: 'lost',
  }
  return map[status] || 'enquiry'
}

export function stageToApiStatus(stage) {
  const map = {
    enquiry: 'new',
    contacted: 'contacted',
    qualified: 'qualified',
    application: 'qualified',
    interview: 'qualified',
    accepted: 'converted',
    enrolled: 'converted',
    lost: 'lost',
  }
  return map[stage] || 'new'
}

export function apiStatusToStage(status) {
  const map = {
    new: 'enquiry',
    contacted: 'contacted',
    qualified: 'qualified',
    converted: 'accepted',
    lost: 'lost',
    lead: 'contacted',
    enquiry: 'enquiry',
  }
  return map[status] || 'enquiry'
}
