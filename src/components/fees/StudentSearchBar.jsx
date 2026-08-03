import { FiSearch } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { resolveStudentId } from '@/utils/studentSearch'

export function StudentSearchBar({
  admissionNo,
  studentName,
  onAdmissionNoChange,
  onStudentNameChange,
  onSearch,
  searching = false,
  searchDisabled = false,
  buttonLabel = 'Search',
}) {
  return (
    <>
      <div className="w-full min-w-[11rem] lg:w-auto lg:min-w-[12rem] lg:flex-1">
        <Input
          label="Admission number"
          value={admissionNo}
          onChange={(e) => onAdmissionNoChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSearch()
            }
          }}
          placeholder="e.g. GREENWOO-2026-0001"
        />
      </div>
      <div className="w-full min-w-[11rem] lg:w-auto lg:min-w-[12rem] lg:flex-1">
        <Input
          label="Student name"
          value={studentName}
          onChange={(e) => onStudentNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onSearch()
            }
          }}
          placeholder="First or full name"
        />
      </div>
      <Button
        variant="secondary"
        className="w-full shrink-0 lg:w-auto lg:mb-0.5"
        disabled={searchDisabled}
        onClick={onSearch}
      >
        <FiSearch className="h-4 w-4" />
        {searching ? 'Searching…' : buttonLabel}
      </Button>
    </>
  )
}

export function StudentSearchCandidates({ candidates, onSelect }) {
  if (!candidates?.length) return null

  return (
    <div className="mt-3 rounded-xl border border-border bg-muted/20 p-3">
      <p className="mb-2 text-xs font-medium text-muted">Multiple students found — select one:</p>
      <ul className="space-y-1">
        {candidates.map((student) => {
          const id = resolveStudentId(student)
          return (
            <li key={id}>
              <button
                type="button"
                className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-card"
                onClick={() => onSelect(student)}
              >
                <span className="font-medium">{student.full_name || '—'}</span>
                <span className="text-xs text-muted">{student.admission_number || '—'}</span>
                {(student.class_name || student.section_name) ? (
                  <span className="w-full text-xs text-muted sm:w-auto sm:text-right">
                    {[student.class_name, student.section_name].filter(Boolean).join(' — ')}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
