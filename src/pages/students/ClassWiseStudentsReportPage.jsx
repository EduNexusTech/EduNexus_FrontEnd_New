import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiDownload } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { academicYearService, studentService } from '@/api/services'
import { listActiveClassSections } from '@/api/activeClassSections'
import { mapClassSectionOptions } from '@/utils/classSections'
import { getErrorMessage, unwrapList } from '@/api/client'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { exportToCsv } from '@/utils/format'

export default function ClassWiseStudentsReportPage() {
  const schoolScope = useSchoolScopedSelection()
  const [yearId, setYearId] = useState('')
  const [sectionId, setSectionId] = useState('')

  const yearsQuery = useQuery({
    queryKey: ['academic-years-class-report', schoolScope.schoolId],
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
  }, [yearId, schoolScope.schoolId])

  const sectionsQuery = useQuery({
    queryKey: ['class-sections-report', schoolScope.schoolId, yearId],
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

  const studentsQuery = useQuery({
    queryKey: ['class-wise-students', schoolScope.schoolId, yearId, sectionId],
    queryFn: () =>
      studentService.search({
        school: schoolScope.schoolId,
        class_section: sectionId,
        academic_year: yearId,
        page_size: 500,
      }),
    enabled: Boolean(schoolScope.schoolId && yearId && sectionId),
  })

  const { results: students, count } = useMemo(
    () => unwrapList(studentsQuery.data),
    [studentsQuery.data],
  )

  const handleExport = () => {
    if (!students.length) {
      toast.error('No students to export')
      return
    }
    const classLabel = selectedSection
      ? `${selectedSection.class_name}-${selectedSection.section_name}`
      : 'class'
    exportToCsv(
      students,
      [
        { header: 'Admission No.', accessor: (r) => r.admission_number || '' },
        { header: 'Name', accessor: (r) => r.full_name || '' },
        { header: 'Roll No.', accessor: (r) => r.roll_number || '' },
        { header: 'Class', accessor: (r) => r.class_name || '' },
        { header: 'Section', accessor: (r) => r.section_name || '' },
        { header: 'Mobile', accessor: (r) => r.mobile_number || '' },
        { header: 'Status', accessor: (r) => r.status || '' },
      ],
      `students-${classLabel}.csv`,
    )
    toast.success('Report exported')
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Students', href: '/students' },
          { label: 'Class-wise Report' },
        ]}
      />
      <PageHeader
        title="Class-wise Students Report"
        description="View and export students by class and section for the selected academic year"
        actions={
          <Link to="/students">
            <Button variant="secondary">Back to SIS Hub</Button>
          </Link>
        }
      />

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SchoolScopeField
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
            required
          />
          <SelectField
            label="Class & section"
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            options={[{ label: 'Select class…', value: '' }, ...sectionOptions]}
            disabled={!yearId || sectionsQuery.isLoading}
            required
          />
        </div>

        {selectedSection ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-slate-50/80 p-4">
            <div>
              <p className="font-semibold text-foreground">
                {selectedSection.class_name} — {selectedSection.section_name}
              </p>
              <p className="text-sm text-muted">
                {studentsQuery.isLoading
                  ? 'Loading students…'
                  : `${count ?? students.length} student(s) in this class`}
              </p>
            </div>
            <Button
              variant="excel"
              disabled={!students.length}
              onClick={handleExport}
            >
              <FiDownload className="h-4 w-4" /> Export Excel
            </Button>
          </div>
        ) : null}
      </Card>

      {!sectionId ? (
        <Card className="p-6 text-center text-sm text-muted">
          Select academic year and class section to view the student list.
        </Card>
      ) : studentsQuery.isLoading ? (
        <PageLoader />
      ) : studentsQuery.error ? (
        <ErrorState message={getErrorMessage(studentsQuery.error)} onRetry={() => studentsQuery.refetch()} />
      ) : (
        <Card padding={false} className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Admission No.</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Roll No.</th>
                <th className="px-4 py-3 text-left font-semibold">Mobile</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No students found in this class for the selected year.
                  </td>
                </tr>
              ) : (
                students.map((row) => (
                  <tr key={row.student_id || row.id} className="border-t border-border">
                    <td className="px-4 py-2">{row.admission_number || '—'}</td>
                    <td className="px-4 py-2 font-medium">{row.full_name || '—'}</td>
                    <td className="px-4 py-2">{row.roll_number || '—'}</td>
                    <td className="px-4 py-2">{row.mobile_number || '—'}</td>
                    <td className="px-4 py-2 capitalize">{row.status || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
