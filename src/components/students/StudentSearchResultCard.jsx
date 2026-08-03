import { Link } from 'react-router-dom'
import { FiExternalLink, FiPhone } from 'react-icons/fi'
import ProfilePhotoFrame from '@/components/common/ProfilePhotoFrame'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Feedback'
import { resolveStudentId } from '@/utils/studentSearch'

export default function StudentSearchResultCard({ student, className = '' }) {
  if (!student?.full_name && !student?.admission_number) return null

  const studentId = resolveStudentId(student)
  const classLabel = [student.class_name, student.section_name].filter(Boolean).join(' — ')

  return (
    <div className={`rounded-xl border border-sky-100 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <ProfilePhotoFrame
          src={student.photo_url}
          alt={student.full_name || student.admission_number || 'Student'}
          emptyLabel="No photo"
          frameClassName="ring-2 ring-white shadow-sm"
        />

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-lg font-semibold text-slate-900">
                  {student.full_name || 'Student'}
                </h4>
                {student.status ? (
                  <StatusBadge status={student.status} label={student.status_display || student.status} />
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted">
                Adm: {student.admission_number || '—'}
                {student.roll_number ? ` · Roll: ${student.roll_number}` : ''}
                {classLabel ? ` · ${classLabel}` : ''}
                {student.academic_year_name ? ` · ${student.academic_year_name}` : ''}
              </p>
            </div>

            {studentId ? (
              <Link to={`/students/${studentId}`} className="shrink-0">
                <Button variant="primary" size="sm">
                  <FiExternalLink className="h-4 w-4" />
                  View full profile
                </Button>
              </Link>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
            {student.mobile_number ? (
              <a
                href={`tel:${student.mobile_number}`}
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <FiPhone className="h-3.5 w-3.5" />
                {student.mobile_number}
              </a>
            ) : null}
            {student.email ? <span>{student.email}</span> : null}
            {student.school_name ? <span>{student.school_name}</span> : null}
          </div>

          {studentId ? (
            <div className="flex flex-wrap gap-2 pt-1">
              <Link to={`/students/${studentId}`}>
                <Button variant="outline" size="sm">Open profile</Button>
              </Link>
              <Link to={`/students/${studentId}/edit`}>
                <Button variant="secondary" size="sm">Edit profile</Button>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
