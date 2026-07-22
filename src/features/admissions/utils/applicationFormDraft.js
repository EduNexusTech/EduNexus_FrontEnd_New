/** Full admission application form_draft schema (mirrors backend application_form.py). */

export function emptyApplicationFormDraft() {
  return {
    student: {
      first_name: '',
      middle_name: '',
      last_name: '',
      admission_number: '',
      gender: '',
      date_of_birth: '',
      age: '',
      blood_group: '',
      nationality: 'Indian',
      religion: '',
      caste_category: '',
      aadhaar_number: '',
      photo_url: '',
    },
    father: {
      name: '',
      qualification: '',
      occupation: '',
      company_name: '',
      annual_income: '',
      mobile: '',
      email: '',
    },
    mother: {
      name: '',
      qualification: '',
      occupation: '',
      company_name: '',
      annual_income: '',
      mobile: '',
      email: '',
    },
    guardian: {
      applicable: false,
      name: '',
      relationship: '',
      mobile: '',
    },
    address: {
      door_no: '',
      street: '',
      area: '',
      city: '',
      district: '',
      state: '',
      country: 'India',
      pincode: '',
      permanent_same_as_communication: true,
      permanent_door_no: '',
      permanent_street: '',
      permanent_area: '',
      permanent_city: '',
      permanent_district: '',
      permanent_state: '',
      permanent_country: 'India',
      permanent_pincode: '',
    },
    previous_school: {
      school_name: '',
      board: '',
      grade_studied: '',
      academic_year: '',
      medium: '',
      percentage_grade: '',
      tc_number: '',
      emis_student_id: '',
    },
    academic: {
      applying_for_grade: '',
      academic_year: '',
      stream: '',
      second_language: '',
      third_language: '',
      elective_subjects: '',
      transport_required: false,
      hostel_required: false,
      day_scholar_or_hosteller: 'day_scholar',
    },
    medical: {
      blood_group: '',
      allergies: '',
      medical_conditions: '',
      disabilities_special_needs: '',
      regular_medication: '',
      emergency_contact_person: '',
      emergency_contact_number: '',
      family_doctor_details: '',
    },
    siblings: [],
    transport: {
      transport_required: false,
      pickup_location: '',
      drop_location: '',
      route: '',
      stop_name: '',
    },
    documents_checklist: {
      student_photograph: false,
      birth_certificate: false,
      aadhaar_card: false,
      parent_aadhaar: false,
      transfer_certificate: false,
      previous_mark_sheets: false,
      address_proof: false,
      community_certificate: false,
      income_certificate: false,
      passport_copy: false,
      vaccination_certificate: false,
    },
    fee_scholarship: {
      scholarship_applied: false,
      scholarship_category: '',
      fee_concession: '',
      payment_plan: '',
      application_fee_paid: false,
    },
    emergency_contact: {
      contact_person: '',
      relationship: '',
      mobile: '',
      alternate_number: '',
    },
    declaration: {
      parent_declaration: false,
      student_declaration: false,
      digital_signature: '',
      declaration_date: new Date().toISOString().slice(0, 10),
    },
  }
}

export function emptySibling() {
  return {
    name: '',
    same_school: false,
    admission_number: '',
    grade: '',
    section: '',
  }
}

export function ageFromDob(dob) {
  if (!dob) return ''
  const d = new Date(`${String(dob).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(d.getTime())) return ''
  const today = new Date()
  let years = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) years -= 1
  return String(Math.max(years, 0))
}

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

/** Deep-merge saved draft onto empty schema so missing keys stay available. */
export function mergeApplicationFormDraft(saved) {
  const base = emptyApplicationFormDraft()
  if (!saved || typeof saved !== 'object') return base

  const merge = (target, source) => {
    Object.keys(source).forEach((key) => {
      const src = source[key]
      if (Array.isArray(src)) {
        target[key] = src
      } else if (isPlainObject(src) && isPlainObject(target[key])) {
        merge(target[key], src)
      } else if (src !== undefined) {
        target[key] = src
      }
    })
    return target
  }

  return merge(base, saved)
}

/** Prefill gaps from application core columns (enquiry convert / older records). */
export function hydrateDraftFromApplication(app) {
  const draft = mergeApplicationFormDraft(app?.form_draft)
  const student = draft.student

  if (!student.first_name && app?.first_name) student.first_name = app.first_name
  if (!student.last_name && app?.last_name) student.last_name = app.last_name
  if (!student.gender && app?.gender) student.gender = app.gender
  if (!student.date_of_birth && app?.date_of_birth) {
    student.date_of_birth = String(app.date_of_birth).slice(0, 10)
  }
  // Always keep age in sync with DOB
  if (student.date_of_birth) student.age = ageFromDob(student.date_of_birth)
  if (!student.admission_number && app?.admission_number) {
    student.admission_number = app.admission_number
  }

  const relation = (app?.parent_relation || '').toLowerCase()
  if (relation.includes('mother')) {
    if (!draft.mother.name && app?.parent_name) draft.mother.name = app.parent_name
    if (!draft.mother.mobile && app?.parent_mobile) draft.mother.mobile = app.parent_mobile
    if (!draft.mother.email && app?.parent_email) draft.mother.email = app.parent_email
  } else if (relation.includes('guardian')) {
    draft.guardian.applicable = true
    if (!draft.guardian.name && app?.parent_name) draft.guardian.name = app.parent_name
    if (!draft.guardian.mobile && app?.parent_mobile) draft.guardian.mobile = app.parent_mobile
  } else {
    if (!draft.father.name && app?.parent_name) draft.father.name = app.parent_name
    if (!draft.father.mobile && app?.parent_mobile) draft.father.mobile = app.parent_mobile
    if (!draft.father.email && app?.parent_email) draft.father.email = app.parent_email
  }

  if (!draft.address.city && app?.city) draft.address.city = app.city
  if (!draft.address.state && app?.state) draft.address.state = app.state
  if (!draft.address.pincode && app?.pincode) draft.address.pincode = app.pincode
  if (!draft.previous_school.school_name && app?.previous_school) {
    draft.previous_school.school_name = app.previous_school
  }
  if (!draft.academic.applying_for_grade && (app?.applied_class_name || app?.applied_section)) {
    draft.academic.applying_for_grade = app.applied_class_name || ''
  }
  if (!draft.academic.academic_year && app?.academic_year_name) {
    draft.academic.academic_year = app.academic_year_name
  }

  if (!draft.emergency_contact.contact_person && app?.parent_name) {
    draft.emergency_contact.contact_person = app.parent_name
    draft.emergency_contact.relationship = app.parent_relation || 'Parent'
    draft.emergency_contact.mobile = app.parent_mobile || ''
  }
  if (!draft.medical.emergency_contact_person && app?.parent_name) {
    draft.medical.emergency_contact_person = app.parent_name
    draft.medical.emergency_contact_number = app.parent_mobile || ''
  }

  return draft
}

/** Build a short list of enquiry fields already loaded into the draft (for UI banner). */
export function getEnquiryPrefillSummary(draft) {
  if (!draft) return []
  const items = []
  const fullName = [draft.student?.first_name, draft.student?.middle_name, draft.student?.last_name]
    .filter(Boolean)
    .join(' ')
  if (fullName) items.push({ label: 'Student', value: fullName })
  if (draft.student?.gender) items.push({ label: 'Gender', value: draft.student.gender })
  if (draft.student?.date_of_birth) {
    items.push({ label: 'DOB', value: draft.student.date_of_birth })
  }
  if (draft.student?.age) items.push({ label: 'Age', value: draft.student.age })
  const parent =
    draft.father?.name || draft.mother?.name || (draft.guardian?.applicable && draft.guardian?.name)
  if (parent) {
    items.push({
      label: 'Parent',
      value: `${parent}${draft.father?.mobile || draft.mother?.mobile || draft.guardian?.mobile ? ` · ${draft.father?.mobile || draft.mother?.mobile || draft.guardian?.mobile}` : ''}`,
    })
  }
  if (draft.address?.city || draft.address?.state) {
    items.push({
      label: 'City / State',
      value: [draft.address.city, draft.address.state].filter(Boolean).join(', '),
    })
  }
  if (draft.previous_school?.school_name) {
    items.push({ label: 'Previous school', value: draft.previous_school.school_name })
  }
  if (draft.academic?.applying_for_grade) {
    items.push({ label: 'Grade', value: draft.academic.applying_for_grade })
  }
  if (draft.academic?.academic_year) {
    items.push({ label: 'Year', value: draft.academic.academic_year })
  }
  return items
}

export const APPLICATION_FORM_SECTIONS = [
  { id: 'student', label: 'Student Information' },
  { id: 'parents', label: 'Parent Details' },
  { id: 'address', label: 'Address' },
  { id: 'previous_school', label: 'Previous School' },
  { id: 'academic', label: 'Academic Details' },
  { id: 'medical', label: 'Medical Details' },
  { id: 'siblings', label: 'Sibling Details' },
  { id: 'transport', label: 'Transport Details' },
  { id: 'documents', label: 'Documents Checklist' },
  { id: 'fee', label: 'Fee & Scholarship' },
  { id: 'emergency', label: 'Emergency Contact' },
  { id: 'declaration', label: 'Declaration' },
]

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
export const BOARDS = ['CBSE', 'ICSE', 'State', 'IB', 'IGCSE', 'Other']
export const DOCUMENT_CHECKLIST_LABELS = {
  student_photograph: 'Student Photograph',
  birth_certificate: 'Birth Certificate',
  aadhaar_card: 'Aadhaar Card',
  parent_aadhaar: 'Parent Aadhaar',
  transfer_certificate: 'Transfer Certificate',
  previous_mark_sheets: 'Previous Mark Sheets',
  address_proof: 'Address Proof',
  community_certificate: 'Community Certificate (if applicable)',
  income_certificate: 'Income Certificate (if applicable)',
  passport_copy: 'Passport Copy (international)',
  vaccination_certificate: 'Vaccination Certificate',
}
