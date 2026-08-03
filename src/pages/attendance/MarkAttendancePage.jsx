import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiUserX,
} from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { academicYearService, attendanceService, studentService } from '@/api/services'
import { listActiveClassSections } from '@/api/activeClassSections'
import { classSectionLabel, mapClassSectionOptions } from '@/utils/classSections'
import { getErrorMessage, unwrapList } from '@/api/client'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { cn } from '@/lib/utils'
import { resolveMediaUrl } from '@/utils/format'

const STATUS_OPTIONS = [
  {
    value: 'present',
    label: 'P',
    title: 'Present',
    active: 'bg-emerald-600 text-white border-emerald-600',
    idle: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
  },
  {
    value: 'absent',
    label: 'A',
    title: 'Absent',
    active: 'bg-rose-600 text-white border-rose-600',
    idle: 'border-rose-200 text-rose-700 hover:bg-rose-50',
  },
  {
    value: 'late',
    label: 'L',
    title: 'Late',
    active: 'bg-amber-500 text-white border-amber-500',
    idle: 'border-amber-200 text-amber-700 hover:bg-amber-50',
  },
  {
    value: 'half_day',
    label: 'HD',
    title: 'Half day',
    active: 'bg-orange-500 text-white border-orange-500',
    idle: 'border-orange-200 text-orange-700 hover:bg-orange-50',
  },
  {
    value: 'leave',
    label: 'LV',
    title: 'Leave',
    active: 'bg-sky-600 text-white border-sky-600',
    idle: 'border-sky-200 text-sky-700 hover:bg-sky-50',
  },
]

function resolveStudentId(student) {
  return student?.student_id || student?.id || ''
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function MarkAttendancePage() {
  const queryClient = useQueryClient()
  const schoolScope = useSchoolScopedSelection()
  const [yearId, setYearId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [attendanceDate, setAttendanceDate] = useState(todayIso)
  const [marks, setMarks] = useState({})
  const [search, setSearch] = useState('')

  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope.listRequestConfig, schoolScope.schoolId],
  )

  const yearsQuery = useQuery({
    queryKey: ['academic-years-attendance-mark', schoolScope.schoolId],
    queryFn: () =>
      academicYearService.list({
        school: schoolScope.schoolId,
        page_size: 100,
        ordering: '-start_date',
      }),
    enabled: Boolean(schoolScope.schoolId),
  })

  const yearOptions = useMemo(() => {
    const { results } = unwrapList(yearsQuery.data)
    return (results || []).map((y) => ({
      label: y.is_current ? `${y.name} (current)` : y.name,
      value: String(y.id),
    }))
  }, [yearsQuery.data])

  useEffect(() => {
    if (!yearId && yearOptions.length) {
      const current = yearOptions.find((y) => y.label.includes('(current)'))
      setYearId(current?.value || yearOptions[0].value)
    }
  }, [yearId, yearOptions])

  useEffect(() => {
    setSectionId('')
    setMarks({})
  }, [yearId, schoolScope.schoolId])

  useEffect(() => {
    setMarks({})
  }, [sectionId, attendanceDate])

  const sectionsQuery = useQuery({
    queryKey: ['class-sections-attendance-mark', schoolScope.schoolId, yearId],
    queryFn: () =>
      listActiveClassSections({
        schoolId: schoolScope.schoolId,
        academicYearId: yearId,
        pageSize: 500,
      }),
    enabled: Boolean(schoolScope.schoolId && yearId),
  })

  const sections = useMemo(() => sectionsQuery.data?.results || [], [sectionsQuery.data])
  const sectionOptions = useMemo(
    () => mapClassSectionOptions(sections, { includeCount: true }),
    [sections],
  )
  const selectedSection = useMemo(
    () => sections.find((cs) => String(cs.id) === sectionId),
    [sections, sectionId],
  )

  const calendarQuery = useQuery({
    queryKey: ['attendance-calendar-day', schoolScope.schoolId, yearId, attendanceDate],
    queryFn: () =>
      attendanceService.calendarDay({
        school: schoolScope.schoolId,
        academic_year: yearId,
        date: attendanceDate,
      }),
    enabled: Boolean(schoolScope.schoolId && yearId && attendanceDate),
  })

  const calendar = calendarQuery.data?.data?.data ?? calendarQuery.data?.data ?? {}

  const studentsQuery = useQuery({
    queryKey: ['attendance-mark-students', schoolScope.schoolId, yearId, sectionId],
    queryFn: () =>
      studentService.search({
        school: schoolScope.schoolId,
        class_section: sectionId,
        academic_year: yearId,
        page_size: 500,
        ordering: 'roll_number,full_name',
      }),
    enabled: Boolean(schoolScope.schoolId && yearId && sectionId),
  })

  const { results: students } = useMemo(() => unwrapList(studentsQuery.data), [studentsQuery.data])

  const existingQuery = useQuery({
    queryKey: [
      'attendance-existing',
      schoolScope.schoolId,
      sectionId,
      attendanceDate,
    ],
    queryFn: () =>
      attendanceService.list({
        school: schoolScope.schoolId,
        subject_type: 'student',
        class_section: sectionId,
        date: attendanceDate,
        page_size: 500,
      }),
    enabled: Boolean(schoolScope.schoolId && sectionId && attendanceDate),
  })

  const existingRecords = useMemo(() => {
    const { results } = unwrapList(existingQuery.data)
    return results || []
  }, [existingQuery.data])

  useEffect(() => {
    if (!students.length) {
      setMarks({})
      return
    }
    const existingByStudent = {}
    for (const rec of existingRecords) {
      const sid = rec.student || rec.student_id
      if (sid) existingByStudent[String(sid)] = rec
    }
    const next = {}
    for (const student of students) {
      const id = resolveStudentId(student)
      const existing = existingByStudent[id]
      next[id] = {
        status: existing?.status || 'present',
        remarks: existing?.remarks || '',
        saved: Boolean(existing),
      }
    }
    setMarks(next)
  }, [students, existingRecords])

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return students
    return students.filter((s) => {
      const name = String(s.full_name || '').toLowerCase()
      const adm = String(s.admission_number || '').toLowerCase()
      const roll = String(s.roll_number || '').toLowerCase()
      return name.includes(q) || adm.includes(q) || roll.includes(q)
    })
  }, [students, search])

  const summary = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, half_day: 0, leave: 0, saved: 0 }
    for (const student of students) {
      const id = resolveStudentId(student)
      const row = marks[id]
      if (!row) continue
      if (counts[row.status] != null) counts[row.status] += 1
      if (row.saved) counts.saved += 1
    }
    return {
      total: students.length,
      ...counts,
    }
  }, [students, marks])

  const setStatus = (studentId, status) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status, saved: false },
    }))
  }

  const setAllStatus = (status) => {
    setMarks((prev) => {
      const next = { ...prev }
      for (const student of students) {
        const id = resolveStudentId(student)
        next[id] = { ...next[id], status, saved: false }
      }
      return next
    })
  }

  const saveMut = useMutation({
    mutationFn: () =>
      attendanceService.bulkMark(
        {
          subject_type: 'student',
          attendance_date: attendanceDate,
          academic_year_id: yearId,
          class_section_id: sectionId,
          attendance_type: 'daily',
          mode: 'bulk',
          marks: students.map((student) => {
            const id = resolveStudentId(student)
            const row = marks[id] || { status: 'present', remarks: '' }
            return {
              student_id: id,
              status: row.status,
              remarks: row.remarks || '',
            }
          }),
        },
        listConfig,
      ),
    onSuccess: (res) => {
      const data = res?.data?.data ?? res?.data ?? {}
      const count = data?.count ?? data?.records?.length ?? students.length
      toast.success(`Attendance saved for ${count} student(s)`)
      queryClient.invalidateQueries({ queryKey: ['attendance-existing'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['attendance-daily-report'] })
      setMarks((prev) => {
        const next = { ...prev }
        for (const id of Object.keys(next)) {
          next[id] = { ...next[id], saved: true }
        }
        return next
      })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const rosterReady = Boolean(sectionId && !studentsQuery.isLoading && !existingQuery.isLoading)
  const isHoliday = calendar.is_holiday === true
  const isWorking = calendar.is_working !== false

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Attendance', href: '/attendance' },
          { label: 'Mark Attendance' },
        ]}
      />

      <PageHeader
        title="Mark Attendance"
        description="Class-wise daily register — select class & section, mark each student, then save."
        actions={
          <Link to="/attendance">
            <Button variant="secondary">Back to Hub</Button>
          </Link>
        }
      />

      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <SchoolScopeField
            className="w-full"
            compact
            schoolId={schoolScope.schoolId}
            setSchoolId={schoolScope.setSchoolId}
            schoolOptions={schoolScope.schoolOptions}
            selectedSchoolLabel={schoolScope.selectedSchoolLabel}
            schoolLocked={schoolScope.schoolLocked}
          />
          <SelectField
            label="Academic year"
            value={yearId}
            onChange={(e) => setYearId(e.target.value)}
            options={[{ label: 'Select…', value: '' }, ...yearOptions]}
          />
          <Input
            type="date"
            label="Attendance date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
          <SelectField
            label="Class & section"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            options={[{ label: 'Select class…', value: '' }, ...sectionOptions]}
            disabled={!yearId || sectionsQuery.isLoading}
          />
        </div>

        {selectedSection ? (
          <p className="mt-3 text-sm font-medium text-primary">
            {classSectionLabel(selectedSection)}
            {(selectedSection.enrolled_count ?? selectedSection.strength) != null
              ? ` · ${selectedSection.enrolled_count ?? selectedSection.strength} students`
              : ''}
          </p>
        ) : null}

        {calendarQuery.isSuccess && calendar.status ? (
          <p
            className={cn(
              'mt-2 text-xs font-medium',
              isHoliday ? 'text-rose-600' : isWorking ? 'text-emerald-700' : 'text-amber-700',
            )}
          >
            {isHoliday
              ? `Holiday — ${calendar.status}`
              : isWorking
                ? 'Working day'
                : `Non-working — ${calendar.status}`}
          </p>
        ) : null}
      </Card>

      {!sectionId ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-muted">Select school, academic year, date, and class & section to load the register.</p>
        </Card>
      ) : studentsQuery.isLoading || existingQuery.isLoading ? (
        <PageLoader />
      ) : studentsQuery.isError ? (
        <ErrorState message={getErrorMessage(studentsQuery.error)} />
      ) : !students.length ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-muted">No enrolled students in this class & section.</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <StatCard title="Total" value={String(summary.total)} icon={FiCheckCircle} />
            <StatCard title="Present" value={String(summary.present)} icon={FiCheckCircle} color="success" />
            <StatCard title="Absent" value={String(summary.absent)} icon={FiUserX} color="warning" />
            <StatCard title="Late" value={String(summary.late)} icon={FiClock} />
            <StatCard title="Half day / Leave" value={String(summary.half_day + summary.leave)} icon={FiClock} />
            <StatCard title="Already saved" value={String(summary.saved)} icon={FiSave} color="primary" />
          </div>

          <Card className="overflow-hidden p-0">
            <div className="flex flex-col gap-3 border-b border-border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative min-w-0 flex-1 sm:max-w-xs">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, roll, admission no."
                  className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setAllStatus('present')}>
                  <FiCheck className="h-4 w-4" /> All present
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAllStatus('absent')}>
                  <FiUserX className="h-4 w-4" /> All absent
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/10 text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-4 py-3 font-medium">Roll</th>
                    <th className="px-4 py-3 font-medium">Admission</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredStudents.map((student, index) => {
                    const id = resolveStudentId(student)
                    const row = marks[id] || { status: 'present', remarks: '', saved: false }
                    const photo = resolveMediaUrl(student.photo_url)
                    return (
                      <tr key={id} className={cn('hover:bg-muted/10', row.saved && 'bg-emerald-50/40')}>
                        <td className="px-4 py-3 text-muted">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {photo ? (
                              <img
                                src={photo}
                                alt=""
                                className="h-10 w-8 shrink-0 border border-border object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-8 shrink-0 items-center justify-center border border-dashed border-border bg-muted/30 text-[10px] text-muted">
                                —
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{student.full_name || '—'}</p>
                              {row.saved ? (
                                <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-600">
                                  Saved
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted">{student.roll_number || '—'}</td>
                        <td className="px-4 py-3 text-muted">{student.admission_number || '—'}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                title={opt.title}
                                onClick={() => setStatus(id, opt.value)}
                                className={cn(
                                  'min-w-[2rem] rounded-md border px-2 py-1 text-xs font-semibold transition',
                                  row.status === opt.value ? opt.active : opt.idle,
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={row.remarks || ''}
                            onChange={(e) =>
                              setMarks((prev) => ({
                                ...prev,
                                [id]: { ...prev[id], remarks: e.target.value, saved: false },
                              }))
                            }
                            placeholder="Optional"
                            className="w-full min-w-[8rem] rounded-md border border-border bg-card px-2 py-1.5 text-xs outline-none focus:border-primary"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredStudents.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted">No students match your search.</p>
            ) : null}

            <div className="sticky bottom-0 flex flex-col gap-3 border-t border-border bg-card/95 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {summary.present} present · {summary.absent} absent · {students.length} total
              </p>
              <Button
                variant="primary"
                disabled={!rosterReady || saveMut.isPending || !students.length}
                onClick={() => saveMut.mutate()}
              >
                {saveMut.isPending ? (
                  <>
                    <FiRefreshCw className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <FiSave className="h-4 w-4" />
                    Save attendance ({students.length})
                  </>
                )}
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
