import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { FiMessageSquare } from 'react-icons/fi'
import { Sheet } from '@/components/ui/Sheet'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import {
  ASSIGNEES,
  ENQUIRY_SOURCE_LABELS,
  ENQUIRY_STATUS_LABELS,
  GENDERS,
  GENDER_LABELS,
  GRADES,
  INDIAN_STATES,
  PARENT_RELATIONSHIP_LABELS,
} from '../types'

const emptyForm = (academicYear) => ({
  studentName: '',
  dateOfBirth: '',
  gender: '',
  gradeApplying: 'Grade 1',
  academicYear,
  parentName: '',
  parentRelationship: 'father',
  phone: '',
  email: '',
  city: '',
  state: '',
  currentSchool: '',
  source: 'website',
  assignedTo: ASSIGNEES[0],
})

export function EnquiryFormSheet({
  open,
  onClose,
  defaultAcademicYear,
  sendApplicationLinkOnSave,
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState(() => emptyForm(defaultAcademicYear))
  const [trackingStatus, setTrackingStatus] = useState('new')

  useEffect(() => {
    if (open) {
      setForm(emptyForm(defaultAcademicYear))
      setTrackingStatus('new')
    }
  }, [open, defaultAcademicYear])

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.studentName.trim() || !form.parentName.trim() || !form.phone.trim()) return
    if (sendApplicationLinkOnSave && !form.email.trim()) return
    await onSubmit({ ...form, enquiryStatus: trackingStatus })
    setForm(emptyForm(defaultAcademicYear))
    setTrackingStatus('new')
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="New Enquiry"
      description="Step 1 — collect minimal details only. Full application comes later."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50/50 px-4 py-3">
          <FiMessageSquare className="h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm text-muted-foreground">
            Keep it short — parents are not overwhelmed. Enquiry number is auto-generated on save.
            {sendApplicationLinkOnSave
              ? ' When you enter the parent email, the online application link can be sent after submit.'
              : null}
          </p>
        </div>

        <FormBlock title="Student Information">
          <Grid>
            <Field label="Student Name" required>
              <input className="lms-input w-full" value={form.studentName} onChange={(e) => update({ studentName: e.target.value })} required />
            </Field>
            <Field label="Date of Birth" required>
              <input className="lms-input w-full" type="date" value={form.dateOfBirth} onChange={(e) => update({ dateOfBirth: e.target.value })} required />
            </Field>
            <Field label="Gender" required>
              <select className="lms-select w-full" value={form.gender} onChange={(e) => update({ gender: e.target.value })} required>
                <option value="">Select</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{GENDER_LABELS[g]}</option>
                ))}
              </select>
            </Field>
            <Field label="Class Applying For" required>
              <select className="lms-select w-full" value={form.gradeApplying} onChange={(e) => update({ gradeApplying: e.target.value })} required>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
            <Field label="Academic Year Applying For" required>
              <input className="lms-input w-full" value={form.academicYear} onChange={(e) => update({ academicYear: e.target.value })} required />
            </Field>
          </Grid>
        </FormBlock>

        <FormBlock title="Parent Information">
          <Grid>
            <Field label="Parent / Guardian Name" required>
              <input className="lms-input w-full" value={form.parentName} onChange={(e) => update({ parentName: e.target.value })} required />
            </Field>
            <Field label="Relationship">
              <select className="lms-select w-full" value={form.parentRelationship} onChange={(e) => update({ parentRelationship: e.target.value })}>
                {Object.entries(PARENT_RELATIONSHIP_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Mobile Number" required>
              <input className="lms-input w-full" value={form.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+91" required />
            </Field>
            <Field label={sendApplicationLinkOnSave ? 'Email Address' : 'Email Address'} required={sendApplicationLinkOnSave}>
              <input
                className="lms-input w-full"
                type="email"
                value={form.email}
                onChange={(e) => update({ email: e.target.value })}
                required={sendApplicationLinkOnSave}
              />
            </Field>
          </Grid>
        </FormBlock>

        <FormBlock title="Address Information">
          <Grid>
            <Field label="City" required>
              <input className="lms-input w-full" value={form.city} onChange={(e) => update({ city: e.target.value })} required />
            </Field>
            <Field label="State" required>
              <select className="lms-select w-full" value={form.state} onChange={(e) => update({ state: e.target.value })} required>
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Grid>
        </FormBlock>

        <FormBlock title="Additional Information">
          <Grid>
            <Field label="Current School Name">
              <input className="lms-input w-full" value={form.currentSchool} onChange={(e) => update({ currentSchool: e.target.value })} />
            </Field>
            <Field label="How did you hear about us?">
              <select className="lms-select w-full" value={form.source} onChange={(e) => update({ source: e.target.value })}>
                {Object.entries(ENQUIRY_SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
          </Grid>
        </FormBlock>

        <FormBlock title="Admission Team Tracking">
          <Grid>
            <Field label="Enquiry Date">
              <input className="lms-input w-full bg-muted" value={dayjs().format('YYYY-MM-DD')} readOnly />
            </Field>
            <Field label="Enquiry Number">
              <input className="lms-input w-full bg-muted font-mono text-xs" value="Auto on save" readOnly />
            </Field>
            <Field label="Counsellor Assigned">
              <select className="lms-select w-full" value={form.assignedTo} onChange={(e) => update({ assignedTo: e.target.value })}>
                {ASSIGNEES.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select className="lms-select w-full" value={trackingStatus} onChange={(e) => setTrackingStatus(e.target.value)}>
                {Object.entries(ENQUIRY_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
          </Grid>
        </FormBlock>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="create" loading={loading}>
            Submit Enquiry
          </Button>
        </div>
      </form>
    </Sheet>
  )
}

function FormBlock({ title, children }) {
  return (
    <section className="rounded-xl border border-border p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  )
}

function Grid({ children }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
    </div>
  )
}
