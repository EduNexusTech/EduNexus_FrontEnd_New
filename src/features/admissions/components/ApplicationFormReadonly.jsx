import { hydrateDraftFromApplication, DOCUMENT_CHECKLIST_LABELS } from '../utils/applicationFormDraft'
import { GENDER_LABELS } from '../types'
import { cn } from '@/lib/utils'

function display(value) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  if (value == null || value === '') return '—'
  return String(value)
}

function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-normal text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words text-sm text-black" style={{ fontWeight: 500 }}>
        {display(value)}
      </dd>
    </div>
  )
}

function Section({ title, children, className }) {
  return (
    <section className={cn('space-y-3', className)}>
      <h3 className="border-b border-border pb-2 text-base font-bold text-black">{title}</h3>
      {children}
    </section>
  )
}

function Grid({ children }) {
  return <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</dl>
}

/**
 * Read-only full application form view (all sections from form_draft + core fields).
 */
export function ApplicationFormReadonly({ application }) {
  const draft = hydrateDraftFromApplication(application || {})
  const student = draft.student || {}
  const father = draft.father || {}
  const mother = draft.mother || {}
  const guardian = draft.guardian || {}
  const address = draft.address || {}
  const previous = draft.previous_school || {}
  const academic = draft.academic || {}
  const medical = draft.medical || {}
  const transport = draft.transport || {}
  const fee = draft.fee_scholarship || {}
  const emergency = draft.emergency_contact || {}
  const declaration = draft.declaration || {}
  const docs = draft.documents_checklist || {}
  const siblings = Array.isArray(draft.siblings) ? draft.siblings : []
  const studentPhoto = student.photo_url || ''

  return (
    <div className="space-y-8">
      <Section title="Student Information">
        {studentPhoto ? (
          <div className="mb-4 flex items-center gap-4">
            <img
              src={studentPhoto}
              alt={`${student.first_name || 'Student'} photo`}
              className="h-24 w-24 rounded-xl object-cover ring-1 ring-border"
            />
            <p className="text-sm text-muted-foreground">Student photograph from application</p>
          </div>
        ) : null}
        <Grid>
          <Field label="First Name" value={student.first_name} />
          <Field label="Middle Name" value={student.middle_name} />
          <Field label="Last Name" value={student.last_name} />
          <Field
            label="Admission Number"
            value={student.admission_number || application?.admission_number}
          />
          <Field label="Gender" value={GENDER_LABELS[student.gender] || student.gender} />
          <Field label="Date of Birth" value={student.date_of_birth} />
          <Field label="Age" value={student.age} />
          <Field label="Blood Group" value={student.blood_group} />
          <Field label="Nationality" value={student.nationality} />
          <Field label="Religion" value={student.religion} />
          <Field label="Caste / Category" value={student.caste_category} />
          <Field label="Aadhaar Number" value={student.aadhaar_number} />
        </Grid>
      </Section>

      <Section title="Parent Details — Father">
        <Grid>
          <Field label="Name" value={father.name} />
          <Field label="Qualification" value={father.qualification} />
          <Field label="Occupation" value={father.occupation} />
          <Field label="Company Name" value={father.company_name} />
          <Field label="Annual Income" value={father.annual_income} />
          <Field label="Mobile" value={father.mobile} />
          <Field label="Email" value={father.email} />
        </Grid>
      </Section>

      <Section title="Parent Details — Mother">
        <Grid>
          <Field label="Name" value={mother.name} />
          <Field label="Qualification" value={mother.qualification} />
          <Field label="Occupation" value={mother.occupation} />
          <Field label="Company Name" value={mother.company_name} />
          <Field label="Annual Income" value={mother.annual_income} />
          <Field label="Mobile" value={mother.mobile} />
          <Field label="Email" value={mother.email} />
        </Grid>
      </Section>

      {guardian.applicable ? (
        <Section title="Guardian">
          <Grid>
            <Field label="Name" value={guardian.name} />
            <Field label="Relationship" value={guardian.relationship} />
            <Field label="Mobile" value={guardian.mobile} />
          </Grid>
        </Section>
      ) : null}

      <Section title="Communication Address">
        <Grid>
          <Field label="Door / House No." value={address.door_no} />
          <Field label="Street" value={address.street} />
          <Field label="Area" value={address.area} />
          <Field label="City" value={address.city} />
          <Field label="District" value={address.district} />
          <Field label="State" value={address.state} />
          <Field label="Country" value={address.country} />
          <Field label="PIN Code" value={address.pincode} />
          <Field
            label="Permanent same as communication"
            value={address.permanent_same_as_communication}
          />
        </Grid>
      </Section>

      {!address.permanent_same_as_communication ? (
        <Section title="Permanent Address">
          <Grid>
            <Field label="Door / House No." value={address.permanent_door_no} />
            <Field label="Street" value={address.permanent_street} />
            <Field label="Area" value={address.permanent_area} />
            <Field label="City" value={address.permanent_city} />
            <Field label="District" value={address.permanent_district} />
            <Field label="State" value={address.permanent_state} />
            <Field label="Country" value={address.permanent_country} />
            <Field label="PIN Code" value={address.permanent_pincode} />
          </Grid>
        </Section>
      ) : null}

      <Section title="Previous School">
        <Grid>
          <Field label="School Name" value={previous.school_name} />
          <Field label="Board" value={previous.board} />
          <Field label="Grade Studied" value={previous.grade_studied} />
          <Field label="Academic Year" value={previous.academic_year} />
          <Field label="Medium" value={previous.medium} />
          <Field label="Percentage / Grade" value={previous.percentage_grade} />
          <Field label="TC Number" value={previous.tc_number} />
          <Field label="EMIS / Student ID" value={previous.emis_student_id} />
        </Grid>
      </Section>

      <Section title="Academic Details">
        <Grid>
          <Field label="Applying For Grade" value={academic.applying_for_grade} />
          <Field label="Academic Year" value={academic.academic_year} />
          <Field label="Stream" value={academic.stream} />
          <Field label="Second Language" value={academic.second_language} />
          <Field label="Third Language" value={academic.third_language} />
          <Field label="Elective Subjects" value={academic.elective_subjects} />
          <Field label="Transport Required" value={academic.transport_required} />
          <Field label="Hostel Required" value={academic.hostel_required} />
          <Field
            label="Day Scholar / Hosteller"
            value={
              academic.day_scholar_or_hosteller === 'hosteller' ? 'Hosteller' : 'Day Scholar'
            }
          />
        </Grid>
      </Section>

      <Section title="Medical Details">
        <Grid>
          <Field label="Blood Group" value={medical.blood_group} />
          <Field label="Allergies" value={medical.allergies} />
          <Field label="Medical Conditions" value={medical.medical_conditions} />
          <Field label="Disabilities / Special Needs" value={medical.disabilities_special_needs} />
          <Field label="Regular Medication" value={medical.regular_medication} />
          <Field label="Emergency Contact Person" value={medical.emergency_contact_person} />
          <Field label="Emergency Contact Number" value={medical.emergency_contact_number} />
          <Field label="Family Doctor" value={medical.family_doctor_details} />
        </Grid>
      </Section>

      <Section title="Sibling Details">
        {siblings.length === 0 ? (
          <p className="text-sm font-normal text-muted-foreground">No siblings added.</p>
        ) : (
          <div className="space-y-4">
            {siblings.map((sib, index) => (
              <div key={index} className="rounded-lg border border-border p-3">
                <p className="mb-2 text-sm" style={{ fontWeight: 600 }}>
                  Sibling {index + 1}
                </p>
                <Grid>
                  <Field label="Name" value={sib.name} />
                  <Field label="Same School" value={sib.same_school} />
                  <Field label="Admission Number" value={sib.admission_number} />
                  <Field label="Grade" value={sib.grade} />
                  <Field label="Section" value={sib.section} />
                </Grid>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Transport Details">
        <Grid>
          <Field label="Transport Required" value={transport.transport_required} />
          <Field label="Pickup Location" value={transport.pickup_location} />
          <Field label="Drop Location" value={transport.drop_location} />
          <Field label="Route" value={transport.route} />
          <Field label="Stop Name" value={transport.stop_name} />
        </Grid>
      </Section>

      <Section title="Documents Checklist">
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(DOCUMENT_CHECKLIST_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
              <span className="font-normal text-black">{label}</span>
              <span style={{ fontWeight: 500 }}>{docs[key] ? 'Yes' : 'No'}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Fee & Scholarship">
        <Grid>
          <Field label="Scholarship Applied" value={fee.scholarship_applied} />
          <Field label="Scholarship Category" value={fee.scholarship_category} />
          <Field label="Fee Concession" value={fee.fee_concession} />
          <Field label="Payment Plan" value={fee.payment_plan} />
          <Field label="Application Fee Paid" value={fee.application_fee_paid} />
        </Grid>
      </Section>

      <Section title="Emergency Contact">
        <Grid>
          <Field label="Contact Person" value={emergency.contact_person} />
          <Field label="Relationship" value={emergency.relationship} />
          <Field label="Mobile" value={emergency.mobile} />
          <Field label="Alternate Number" value={emergency.alternate_number} />
        </Grid>
      </Section>

      <Section title="Declaration">
        <Grid>
          <Field label="Parent Declaration" value={declaration.parent_declaration} />
          <Field label="Student Declaration" value={declaration.student_declaration} />
          <Field label="Digital Signature" value={declaration.digital_signature} />
          <Field label="Date" value={declaration.declaration_date} />
        </Grid>
      </Section>

      {application?.notes ? (
        <Section title="Notes">
          <p className="whitespace-pre-wrap text-sm font-normal text-black">{application.notes}</p>
        </Section>
      ) : null}
    </div>
  )
}
