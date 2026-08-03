import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiArrowRight, FiRefreshCw, FiShuffle } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { academicYearService, studentService } from '@/api/services'
import { listActiveClassSections } from '@/api/activeClassSections'
import { classSectionLabel, mapClassSectionOptions, sortClassSections } from '@/utils/classSections'
import { getErrorMessage, unwrapList } from '@/api/client'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { cn } from '@/lib/utils'

function resolveStudentId(student) {
  return student?.student_id || student?.id || ''
}

export default function StudentShufflePage() {
  const queryClient = useQueryClient()
  const schoolScope = useSchoolScopedSelection()
  const [yearId, setYearId] = useState('')
  const [mode, setMode] = useState('section')
  const [sourceSectionId, setSourceSectionId] = useState('')
  const [targetSectionId, setTargetSectionId] = useState('')
  const [selectedIds, setSelectedIds] = useState([])

  const yearsQuery = useQuery({
    queryKey: ['academic-years-shuffle', schoolScope.schoolId],
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
    setSourceSectionId('')
    setTargetSectionId('')
    setSelectedIds([])
  }, [yearId, schoolScope.schoolId, mode])

  useEffect(() => {
    setTargetSectionId('')
    setSelectedIds([])
  }, [sourceSectionId])

  const sectionsQuery = useQuery({
    queryKey: ['class-sections-shuffle', schoolScope.schoolId, yearId],
    queryFn: () =>
      listActiveClassSections({
        schoolId: schoolScope.schoolId,
        academicYearId: yearId,
        pageSize: 500,
      }),
    enabled: Boolean(schoolScope.schoolId && yearId),
  })

  const sections = useMemo(() => sectionsQuery.data?.results || [], [sectionsQuery.data])

  const sourceSection = useMemo(
    () => sections.find((cs) => String(cs.id) === sourceSectionId),
    [sections, sourceSectionId],
  )

  const targetSections = useMemo(() => {
    if (!sourceSection) return []
    if (mode === 'section') {
      return sortClassSections(
        sections.filter(
          (cs) =>
            cs.class_id === sourceSection.class_id
            && String(cs.id) !== sourceSectionId,
        ),
      )
    }
    return sortClassSections(sections.filter((cs) => String(cs.id) !== sourceSectionId))
  }, [sections, sourceSection, sourceSectionId, mode])

  const sourceOptions = useMemo(
    () => mapClassSectionOptions(sections, { includeCount: true }),
    [sections],
  )

  const targetOptions = useMemo(
    () => mapClassSectionOptions(targetSections, { includeCount: true }),
    [targetSections],
  )

  const targetSection = useMemo(
    () => targetSections.find((cs) => String(cs.id) === targetSectionId),
    [targetSections, targetSectionId],
  )

  const studentsQuery = useQuery({
    queryKey: ['shuffle-source-students', schoolScope.schoolId, yearId, sourceSectionId],
    queryFn: () =>
      studentService.search({
        school: schoolScope.schoolId,
        class_section: sourceSectionId,
        academic_year: yearId,
        page_size: 500,
      }),
    enabled: Boolean(schoolScope.schoolId && yearId && sourceSectionId),
  })

  const { results: students } = useMemo(() => unwrapList(studentsQuery.data), [studentsQuery.data])

  const allSelected = students.length > 0 && selectedIds.length === students.length

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(students.map((s) => resolveStudentId(s)).filter(Boolean))
    }
  }

  const toggleOne = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const shuffleMut = useMutation({
    mutationFn: () =>
      studentService.bulkShuffle(
        {
          student_ids: selectedIds,
          to_class_section: targetSectionId,
          academic_year_id: yearId,
          shuffle_mode: mode === 'section' ? 'section' : 'standard',
          reason: mode === 'section' ? 'Section shuffle' : 'Standard shuffle',
        },
        {
          params: { school: schoolScope.schoolId },
          ...schoolScope.listRequestConfig,
        },
      ),
    onSuccess: (res) => {
      const data = res?.data?.data ?? res?.data ?? res ?? {}
      const moved = data?.moved ?? 0
      const errors = data?.errors?.length ?? 0
      queryClient.invalidateQueries({ queryKey: ['shuffle-source-students'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
      queryClient.invalidateQueries({ queryKey: ['sis-dashboard'] })
      setSelectedIds([])
      if (errors > 0) {
        toast.success(`Moved ${moved} student(s). ${errors} could not be moved.`)
      } else {
        toast.success(`Moved ${moved} student(s) successfully`)
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleShuffle = () => {
    if (!selectedIds.length) {
      toast.error('Select at least one student')
      return
    }
    if (!targetSectionId) {
      toast.error('Select target class and section')
      return
    }
    shuffleMut.mutate()
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Students', href: '/students' },
          { label: 'Class / Section Shuffle' },
        ]}
      />

      <PageHeader
        title="Student Shuffle"
        description="Move students between sections (same standard) or between standards within an academic year."
        actions={
          <Link to="/students">
            <Button variant="secondary">Back to SIS Hub</Button>
          </Link>
        }
      />

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
          <SchoolScopeField
            className="w-full min-w-[10rem] lg:w-auto lg:min-w-[11rem] lg:flex-1"
            compact
            schoolId={schoolScope.schoolId}
            setSchoolId={schoolScope.setSchoolId}
            schoolOptions={schoolScope.schoolOptions}
            selectedSchoolLabel={schoolScope.selectedSchoolLabel}
            schoolLocked={schoolScope.schoolLocked}
          />
          <div className="w-full min-w-[10rem] lg:w-auto lg:min-w-[11rem] lg:flex-1">
            <SelectField
              label="Academic year"
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
              options={[{ label: 'Select…', value: '' }, ...yearOptions]}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('section')}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition',
              mode === 'section'
                ? 'bg-primary text-white shadow-sm'
                : 'border border-border bg-muted/30 text-muted hover:text-foreground',
            )}
          >
            Section shuffle
          </button>
          <button
            type="button"
            onClick={() => setMode('standard')}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition',
              mode === 'standard'
                ? 'bg-primary text-white shadow-sm'
                : 'border border-border bg-muted/30 text-muted hover:text-foreground',
            )}
          >
            Standard shuffle
          </button>
        </div>
        <p className="mt-2 text-xs text-muted">
          {mode === 'section'
            ? 'Move students to another section within the same standard (e.g. Class 1 A → Class 1 B).'
            : 'Move students to any other standard and section in the selected academic year.'}
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="flex min-h-[28rem] flex-col p-5">
          <h3 className="mb-1 text-sm font-semibold text-foreground">From — source class & section</h3>
          <p className="mb-4 text-xs text-muted">Select where students are now, then choose who to move.</p>

          <SelectField
            label="Source class & section"
            value={sourceSectionId}
            onChange={(e) => setSourceSectionId(e.target.value)}
            options={[{ label: 'Select source…', value: '' }, ...sourceOptions]}
            disabled={!yearId || sectionsQuery.isLoading}
          />

          {sourceSection ? (
            <p className="mt-2 text-xs font-medium text-primary">
              {classSectionLabel(sourceSection)}
              {(sourceSection.enrolled_count ?? sourceSection.strength) != null
                ? ` · ${sourceSection.enrolled_count ?? sourceSection.strength} enrolled`
                : ''}
            </p>
          ) : null}

          <div className="mt-4 min-h-0 flex-1 overflow-hidden rounded-xl border border-border">
            {!sourceSectionId ? (
              <p className="p-6 text-center text-sm text-muted">Select a source class and section.</p>
            ) : studentsQuery.isLoading ? (
              <PageLoader />
            ) : studentsQuery.isError ? (
              <ErrorState message={getErrorMessage(studentsQuery.error)} />
            ) : !students.length ? (
              <p className="p-6 text-center text-sm text-muted">No students in this section.</p>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border bg-muted/20 px-3 py-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    Select all ({students.length})
                  </label>
                  <span className="text-xs text-muted">{selectedIds.length} selected</span>
                </div>
                <ul className="max-h-80 overflow-y-auto divide-y divide-border/60">
                  {students.map((student) => {
                    const id = resolveStudentId(student)
                    return (
                      <li key={id}>
                        <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-muted/20">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(id)}
                            onChange={() => toggleOne(id)}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{student.full_name || '—'}</p>
                            <p className="text-xs text-muted">
                              Adm: {student.admission_number || '—'}
                              {student.roll_number ? ` · Roll: ${student.roll_number}` : ''}
                            </p>
                          </div>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </div>
        </Card>

        <Card className="flex min-h-[28rem] flex-col p-5">
          <h3 className="mb-1 text-sm font-semibold text-foreground">To — target class & section</h3>
          <p className="mb-4 text-xs text-muted">Choose where selected students should be moved.</p>

          <SelectField
            label="Target class & section"
            value={targetSectionId}
            onChange={(e) => setTargetSectionId(e.target.value)}
            options={[{ label: 'Select target…', value: '' }, ...targetOptions]}
            disabled={!sourceSectionId || !targetSections.length}
          />

          {targetSection ? (
            <div className="mt-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 text-sm">
              <p className="font-medium text-foreground">Move to</p>
              <p className="mt-1 text-primary">{classSectionLabel(targetSection)}</p>
            </div>
          ) : sourceSectionId && !targetSections.length ? (
            <p className="mt-3 text-sm text-muted">No other sections available for this shuffle mode.</p>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 pt-6">
            <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-muted/10 p-4 text-sm">
              <span className="font-medium">{sourceSection ? classSectionLabel(sourceSection) : 'Source'}</span>
              <FiArrowRight className="h-5 w-5 shrink-0 text-primary" />
              <span className="font-medium">{targetSection ? classSectionLabel(targetSection) : 'Target'}</span>
            </div>

            <Button
              variant="primary"
              className="w-full"
              disabled={
                !selectedIds.length
                || !targetSectionId
                || shuffleMut.isPending
              }
              onClick={handleShuffle}
            >
              {shuffleMut.isPending ? (
                <>
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  Moving…
                </>
              ) : (
                <>
                  <FiShuffle className="h-4 w-4" />
                  Move {selectedIds.length || ''} student{selectedIds.length === 1 ? '' : 's'}
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
