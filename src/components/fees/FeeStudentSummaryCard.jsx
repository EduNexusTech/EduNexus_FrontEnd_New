import { FiPhone, FiUser } from 'react-icons/fi'
import ProfilePhotoFrame from '@/components/common/ProfilePhotoFrame'

function ContactRow({ label, name, mobile }) {
  if (!name && !mobile) return null
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-700">
      <span className="font-medium text-slate-900">{label}</span>
      <span>{name || '—'}</span>
      {mobile ? (
        <a href={`tel:${mobile}`} className="inline-flex items-center gap-1 text-primary hover:underline">
          <FiPhone className="h-3.5 w-3.5" />
          {mobile}
        </a>
      ) : null}
    </div>
  )
}

/**
 * Student identity card for fee screens — photo, class, parent contacts.
 */
export default function FeeStudentSummaryCard({
  student,
  outstanding,
  academicYearName,
  className = '',
}) {
  if (!student?.full_name && !student?.admission_number) return null

  const classLabel = [student.class_name, student.section_name].filter(Boolean).join(' — ')

  return (
    <div className={`rounded-xl border border-border bg-slate-50/80 p-4 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <ProfilePhotoFrame
          src={student.photo_url}
          alt={student.full_name || student.admission_number || 'Student'}
          emptyLabel="No photo"
          frameClassName="ring-2 ring-white shadow-sm"
        />

        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {student.full_name || 'Student'}
            </p>
            <p className="text-sm text-muted">
              Adm: {student.admission_number || '—'}
              {classLabel ? ` · ${classLabel}` : ''}
              {academicYearName ? ` · ${academicYearName}` : ''}
            </p>
          </div>

          {student.mobile_number ? (
            <div className="flex flex-wrap items-center gap-1 text-sm text-slate-700">
              <FiUser className="h-3.5 w-3.5 text-slate-500" />
              <span className="font-medium text-slate-900">Student</span>
              <a href={`tel:${student.mobile_number}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <FiPhone className="h-3.5 w-3.5" />
                {student.mobile_number}
              </a>
            </div>
          ) : null}

          <div className="grid gap-1.5 sm:grid-cols-2">
            <ContactRow label="Father" name={student.father_name} mobile={student.father_mobile} />
            <ContactRow label="Mother" name={student.mother_name} mobile={student.mother_mobile} />
          </div>

          {student.is_staff_child || student.staff_child_status === 'Yes' ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 px-3 py-2 text-sm">
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <span className="font-medium text-slate-700">Staff child: </span>
                  <span className="font-semibold text-emerald-800">Yes</span>
                </span>
                {student.staff_name ? (
                  <span>
                    <span className="font-medium text-slate-700">Staff name: </span>
                    <span className="font-semibold text-slate-900">{student.staff_name}</span>
                    {student.staff_employee_id ? (
                      <span className="text-muted"> ({student.staff_employee_id})</span>
                    ) : null}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          {outstanding != null && outstanding !== '' ? (
            <p className="pt-1 text-sm font-semibold text-slate-900">
              Outstanding: <span className="text-red-700">{outstanding}</span>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
