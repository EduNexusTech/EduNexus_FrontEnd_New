import { useState } from 'react'
import { FiPlus, FiSettings, FiAlertCircle } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/common/PageHeader'
import { AdmissionsSubNav } from '../components/AdmissionsSubNav'
import { AcademicYearCard } from '../components/AcademicYearCard'
import { AcademicYearForm } from '../components/AcademicYearForm'
import { AcademicYearSelector } from '../components/AcademicYearSelector'
import { AdmissionEmailSettingsCard } from '../components/AdmissionEmailSettingsCard'
import { useAdmissionSetup } from '../hooks/useAdmissionSetup'
import { ADMISSION_FEATURE_META } from '../types/setup'

export default function AdmissionSetupPage() {
  const {
    academicYears,
    addAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    toggleYearStatus,
    setCurrentYear,
    toggleFeature,
    currentYear,
    isYearActive,
  } = useAdmissionSetup()

  const [formOpen, setFormOpen] = useState(false)
  const [editingYear, setEditingYear] = useState(null)

  const openCreate = () => {
    setEditingYear(null)
    setFormOpen(true)
  }

  const openEdit = (year) => {
    setEditingYear(year)
    setFormOpen(true)
  }

  const handleSubmit = async (input) => {
    if (editingYear) {
      await updateAcademicYear(editingYear.id, input)
    } else {
      await addAcademicYear(input)
    }
  }

  const activeYears = academicYears.filter((y) => y.status === 'active').length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admission Setup"
        description="Manage academic years and configure which admission modules are active"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <AcademicYearSelector />
            <Button variant="primary" onClick={openCreate}>
              <FiPlus className="h-4 w-4" />
              Add Academic Year
            </Button>
          </div>
        }
      />
      <AdmissionsSubNav />

      {currentYear && !isYearActive ? (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <FiAlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Academic year {currentYear.label} is inactive</p>
            <p className="mt-1 text-amber-800/90">
              All admission modules are hidden until you activate this year. Toggle status on the year
              card below or switch to an active year.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding={false}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Years</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{academicYears.length}</p>
          </CardContent>
        </Card>
        <Card padding={false}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Years</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeYears}</p>
          </CardContent>
        </Card>
        <Card padding={false}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Year</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{currentYear?.label ?? '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Card padding={false}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FiSettings className="h-5 w-5 text-brand-600" />
            <CardTitle>How it works</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong className="text-foreground">Active</strong> academic years show enabled modules
              in the admission process.
            </li>
            <li>
              <strong className="text-foreground">Inactive</strong> years hide all modules until
              reactivated.
            </li>
            <li>
              Use checkboxes on each year to control: Enquiry, Online Admission Form, Assessment,
              Exams, Timetable, Follow-ups, Applications, and Conversion.
            </li>
          </ul>
        </CardContent>
      </Card>

      <AdmissionEmailSettingsCard />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Academic Years</h2>
        {academicYears.length === 0 ? (
          <Card className="border-dashed" padding={false}>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No academic years configured yet.</p>
              <Button className="mt-4" variant="primary" onClick={openCreate}>
                Add your first academic year
              </Button>
            </CardContent>
          </Card>
        ) : (
          academicYears.map((year) => (
            <AcademicYearCard
              key={year.id}
              year={year}
              onEdit={openEdit}
              onDelete={deleteAcademicYear}
              onToggleStatus={toggleYearStatus}
              onSetCurrent={setCurrentYear}
              onToggleFeature={toggleFeature}
            />
          ))
        )}
      </div>

      {currentYear && currentYear.status === 'active' ? (
        <Card padding={false}>
          <CardHeader>
            <CardTitle className="text-base">Active modules for {currentYear.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.keys(ADMISSION_FEATURE_META).map((key) => (
                <span
                  key={key}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    currentYear.features[key]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-muted text-muted-foreground line-through'
                  }`}
                >
                  {ADMISSION_FEATURE_META[key].label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <AcademicYearForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initial={editingYear}
      />
    </div>
  )
}
