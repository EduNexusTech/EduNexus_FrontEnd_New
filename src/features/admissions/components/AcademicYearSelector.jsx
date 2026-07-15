import { FiCalendar } from 'react-icons/fi'
import { Badge } from '@/components/ui/Badge'
import { useAdmissionSetup } from '../hooks/useAdmissionSetup'

export function AcademicYearSelector() {
  const { academicYears, currentYear, setSelectedYearId } = useAdmissionSetup()

  if (!academicYears.length) return null

  return (
    <div className="flex items-center gap-2">
      <FiCalendar className="hidden h-4 w-4 text-muted-foreground sm:block" />
      <select
        value={currentYear?.id ?? ''}
        onChange={(e) => setSelectedYearId(e.target.value)}
        className="h-9 w-[140px] rounded-lg border border-input bg-card px-3 text-xs sm:w-[160px]"
        aria-label="Select academic year"
      >
        {academicYears.map((year) => (
          <option key={year.id} value={year.id}>
            {year.label}
            {year.isCurrent ? ' (Current)' : ''}
          </option>
        ))}
      </select>
      {currentYear ? (
        <Badge variant={currentYear.status === 'active' ? 'success' : 'secondary'}>
          {currentYear.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ) : null}
    </div>
  )
}
