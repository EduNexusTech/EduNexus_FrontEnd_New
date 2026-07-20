import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiBook,
  FiBookOpen,
  FiClipboard,
  FiEdit3,
  FiLayers,
  FiPlus,
  FiTarget,
  FiVideo,
  FiMessageSquare,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { lmsService, academicYearService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const QUICK_LINKS = [
  { to: '/lms/courses', label: 'Courses', icon: FiBook, desc: 'Catalog, units, lessons, learning paths' },
  { to: '/lms/assignments', label: 'Assignments & Homework', icon: FiClipboard, desc: 'Draft → assign → review workflow' },
  { to: '/lms/lesson-plans', label: 'Lesson Plans', icon: FiEdit3, desc: 'Weekly, monthly, annual plans with approval' },
  { to: '/lms/quizzes', label: 'Quizzes', icon: FiTarget, desc: 'Inline quiz engine (formal exams use Assessments)' },
]

export default function LmsHubPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const schoolId = user?.school_id || user?.school || undefined
  const [courseForm, setCourseForm] = useState({ name: '', code: '', academic_year_id: '' })

  const dashQuery = useQuery({
    queryKey: ['lms-dashboard', schoolId],
    queryFn: () => lmsService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const yearsQuery = useQuery({
    queryKey: ['academic-years-lms', schoolId],
    queryFn: () => academicYearService.list(schoolId ? { school: schoolId, page_size: 50 } : { page_size: 50 }),
    enabled: Boolean(schoolId),
  })

  const years = useMemo(() => {
    const raw = yearsQuery.data?.data?.results ?? yearsQuery.data?.results ?? []
    return Array.isArray(raw) ? raw : []
  }, [yearsQuery.data])

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])

  const createCourse = useMutation({
    mutationFn: (payload) => lmsService.createCourse({ ...payload, school_id: schoolId }),
    onSuccess: () => {
      toast.success('Course created')
      setCourseForm({ name: '', code: '', academic_year_id: '' })
      qc.invalidateQueries({ queryKey: ['lms-dashboard'] })
      qc.invalidateQueries({ queryKey: ['lms-courses'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Management System"
        description="Enterprise LMS — courses, lesson planning, homework, quizzes, content & analytics. Homework and lesson plans live here; formal exams use the Assessment Engine."
        actions={
          <Link to="/lms/courses">
            <Button variant="primary"><FiBookOpen className="h-4 w-4" /> Browse Courses</Button>
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Courses" value={String(dash.total_courses ?? '—')} icon={FiBook} />
        <StatCard title="Published Courses" value={String(dash.published_courses ?? '—')} icon={FiLayers} color="success" />
        <StatCard title="Active Assignments" value={String(dash.active_assignments ?? '—')} icon={FiClipboard} />
        <StatCard title="Pending Reviews" value={String(dash.pending_submissions ?? '—')} icon={FiEdit3} color="warning" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_LINKS.map((item) => (
          <Link key={item.to} to={item.to} className="block">
            <Card className="h-full p-4 transition hover:border-primary-300">
              <div className="flex items-start gap-3">
                <item.icon className="mt-0.5 h-5 w-5 text-primary-600" />
                <div>
                  <div className="font-medium text-slate-900">{item.label}</div>
                  <div className="text-sm text-slate-500">{item.desc}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FiPlus className="h-5 w-5 text-primary-600" /> Quick Create Course
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Course Name"
              value={courseForm.name}
              onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Mathematics Grade 10"
            />
            <Input
              label="Code"
              value={courseForm.code}
              onChange={(e) => setCourseForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="math-g10"
            />
            <SelectField
              label="Academic Year"
              value={courseForm.academic_year_id}
              onChange={(e) => setCourseForm((f) => ({ ...f, academic_year_id: e.target.value }))}
              options={[
                { value: '', label: 'Select year…' },
                ...years.map((y) => ({ value: y.id, label: y.name })),
              ]}
            />
          </div>
          <div className="mt-4">
            <Button
              variant="primary"
              disabled={!courseForm.name || !courseForm.code || !courseForm.academic_year_id || createCourse.isPending}
              onClick={() => createCourse.mutate(courseForm)}
            >
              Create Course
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <FiMessageSquare className="h-5 w-5 text-primary-600" /> Ecosystem
          </h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><strong>Lesson plans published:</strong> {dash.lesson_plans_published ?? '—'}</li>
            <li><strong>Delivery modes:</strong> offline, online, blended, hybrid, self-paced, instructor-led, AI-assisted</li>
            <li><strong>Content:</strong> PDF, video, SCORM, H5P, YouTube, Drive integrations</li>
            <li><strong>Live classes:</strong> Zoom, Meet, Teams, Jitsi, BigBlueButton (integration stubs)</li>
            <li><strong>Formal exams:</strong> use <Link to="/examinations" className="text-primary-600 hover:underline">Assessment Engine</Link> — not duplicated here</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/lms/assignments"><Button variant="secondary" size="sm">Assignments</Button></Link>
            <Link to="/homework"><Button variant="secondary" size="sm">Homework</Button></Link>
            <Link to="/examinations"><Button variant="secondary" size="sm">Examinations</Button></Link>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-slate-900">
          <FiVideo className="h-5 w-5 text-primary-600" /> Role Dashboards
        </h3>
        <p className="text-sm text-slate-500">
          Student, teacher, and parent LMS dashboards are available via API and will surface in portal views as roles are assigned.
          Gamification, forums, and AI tutor foundations are enabled per school LMS settings.
        </p>
      </Card>
    </div>
  )
}

export function LmsCoursesPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const coursesQuery = useQuery({
    queryKey: ['lms-courses', schoolId],
    queryFn: () => lmsService.courses(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const courses = useMemo(() => {
    const data = unwrap(coursesQuery.data)
    return data.results ?? []
  }, [coursesQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="LMS Courses"
        description="Course catalog with units, chapters, topics, lessons and learning paths."
        actions={
          <Link to="/lms"><Button variant="secondary">LMS Hub</Button></Link>
        }
      />
      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Code</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No courses yet — create one from the LMS hub.</td></tr>
            ) : courses.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                <td className="px-4 py-3 text-slate-600">{c.code}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{c.status}</span></td>
                <td className="px-4 py-3 text-slate-600">{c.delivery_mode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export function LmsAssignmentsPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const params = useMemo(() => {
    const p = schoolId ? { school: schoolId } : {}
    if (typeof window !== 'undefined' && window.location.search.includes('kind=homework')) {
      return { ...p, assignment_kind: 'homework' }
    }
    return p
  }, [schoolId])

  const assignmentsQuery = useQuery({
    queryKey: ['lms-assignments', schoolId, params.assignment_kind],
    queryFn: () => (params.assignment_kind === 'homework'
      ? lmsService.homework(params)
      : lmsService.assignments(params)),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const items = useMemo(() => unwrap(assignmentsQuery.data).results ?? [], [assignmentsQuery.data])
  const isHomework = params.assignment_kind === 'homework'

  return (
    <div className="space-y-6">
      <PageHeader
        title={isHomework ? 'Homework' : 'Assignments'}
        description={isHomework
          ? 'Homework is part of the LMS — same workflow as assignments.'
          : 'Assignment workflow: draft → assigned → submitted → reviewed → completed.'}
        actions={
          <div className="flex gap-2">
            <Link to={isHomework ? '/lms/assignments' : '/homework'}>
              <Button variant="secondary">{isHomework ? 'All Assignments' : 'Homework Only'}</Button>
            </Link>
            <Link to="/lms"><Button variant="secondary">LMS Hub</Button></Link>
          </div>
        }
      />
      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Title</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Kind</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No items yet.</td></tr>
            ) : items.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{a.title}</td>
                <td className="px-4 py-3 text-slate-600">{a.assignment_kind}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{a.status}</span></td>
                <td className="px-4 py-3 text-slate-600">{a.due_date ? new Date(a.due_date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export function LmsLessonPlansPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const plansQuery = useQuery({
    queryKey: ['lms-lesson-plans', schoolId],
    queryFn: () => lmsService.lessonPlans(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const plans = useMemo(() => unwrap(plansQuery.data).results ?? [], [plansQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lesson Plans"
        description="Integrated lesson planning — objectives, strategy, aids, homework mapping, approval workflow."
        actions={<Link to="/lms"><Button variant="secondary">LMS Hub</Button></Link>}
      />
      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Topic</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Cadence</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {plans.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No lesson plans yet.</td></tr>
            ) : plans.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-medium text-slate-900">{p.topic}</td>
                <td className="px-4 py-3 text-slate-600">{p.plan_date}</td>
                <td className="px-4 py-3 text-slate-600">{p.cadence}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export function LmsQuizzesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="LMS Quizzes"
        description="Inline timed quizzes for formative assessment. Board exams and report cards use the Assessment Engine."
        actions={<Link to="/lms"><Button variant="secondary">LMS Hub</Button></Link>}
      />
      <Card className="p-6 text-sm text-slate-600">
        Select a course from the course catalog to create and manage quizzes. Question Bank full module is a future phase — foundation architecture is in place on the backend.
      </Card>
    </div>
  )
}
