export const DEFAULT_ADMISSION_EMAIL_SETTINGS = {
  senderName: 'Admissions Team',
  senderEmail: 'admissions@school.edu',
  emailIntro:
    'Thank you for your interest in admitting {studentName} to {schoolName} for the academic year {academicYear}. We have successfully received your enquiry (Reference: {enquiryNumber}) and look forward to welcoming your family to our school community.',
}

export const ADMISSION_FEATURE_META = {
  enquiry: {
    label: 'Enquiry',
    description: 'Capture and manage admission enquiries',
    group: 'admissions',
  },
  onlineAdmissionForm: {
    label: 'Online Admission Form',
    description: 'Public-facing online application form',
    group: 'admissions',
  },
  internalApplication: {
    label: 'Internal Applications',
    description: 'In-house student application processing',
    group: 'admissions',
  },
  externalApplication: {
    label: 'External Applications',
    description: 'Transfer and external student applications',
    group: 'admissions',
  },
  followUps: {
    label: 'Follow-ups',
    description: 'Scheduled follow-up tasks for leads',
    group: 'admissions',
  },
  conversion: {
    label: 'Student Conversion',
    description: 'Convert accepted leads to enrolled students',
    group: 'admissions',
  },
  assessment: {
    label: 'Assessment',
    description: 'Admission assessments and evaluations',
    group: 'academics',
  },
  exams: {
    label: 'Exams',
    description: 'Entrance exams and examination scheduling',
    group: 'academics',
  },
  timetable: {
    label: 'Timetable',
    description: 'Class and admission interview timetables',
    group: 'academics',
  },
}

export const DEFAULT_ADMISSION_FEATURES = {
  enquiry: true,
  onlineAdmissionForm: true,
  assessment: false,
  exams: false,
  timetable: false,
  followUps: true,
  internalApplication: true,
  externalApplication: true,
  conversion: true,
}
