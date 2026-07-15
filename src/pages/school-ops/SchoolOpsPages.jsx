import {
  FiCalendar,
  FiBook,
  FiClipboard,
  FiRadio,
  FiFileText,
  FiCreditCard,
  FiTruck,
  FiBookOpen,
  FiBarChart2,
  FiUsers,
  FiLayers,
} from 'react-icons/fi'
import ModulePage from '@/components/common/ModulePage'

export function AttendancePage() {
  return (
    <ModulePage
      title="Attendance"
      description="Daily attendance registers, class-wise marking, and reports"
      searchPlaceholder="Search students or classes..."
      stats={[
        { title: 'Present Today', value: '—', icon: FiCalendar, color: 'success' },
        { title: 'Absent Today', value: '—', icon: FiUsers, color: 'warning' },
        { title: 'Attendance Rate', value: '—', icon: FiBarChart2, color: 'primary' },
      ]}
      emptyTitle="Attendance module ready"
      emptyDescription="Mark and track student attendance by class section — same layout as LMS_School."
    />
  )
}

export function TimetablePage() {
  return (
    <ModulePage
      title="Timetable"
      description="Class schedules, periods, and teacher allocations"
      searchPlaceholder="Search by class or teacher..."
      stats={[
        { title: 'Classes Scheduled', value: '—', icon: FiCalendar },
        { title: 'Periods Today', value: '—', icon: FiLayers },
        { title: 'Teachers Assigned', value: '—', icon: FiUsers },
      ]}
      emptyTitle="Timetable module ready"
      emptyDescription="Build weekly class timetables using periods and class sections."
    />
  )
}

export function HomeworkPage() {
  return (
    <ModulePage
      title="Homework"
      description="Assign, track, and review homework across classes"
      searchPlaceholder="Search homework..."
      stats={[
        { title: 'Active Assignments', value: '—', icon: FiClipboard },
        { title: 'Due This Week', value: '—', icon: FiCalendar },
        { title: 'Submitted', value: '—', icon: FiFileText, color: 'success' },
      ]}
      emptyTitle="Homework module ready"
      emptyDescription="Create and manage homework assignments for students and parents."
    />
  )
}

export function AnnouncementsPage() {
  return (
    <ModulePage
      title="Announcements"
      description="School-wide notices for students, parents, and staff"
      searchPlaceholder="Search announcements..."
      stats={[
        { title: 'Published', value: '—', icon: FiRadio },
        { title: 'Drafts', value: '—', icon: FiFileText },
        { title: 'This Month', value: '—', icon: FiCalendar },
      ]}
      emptyTitle="Announcements module ready"
      emptyDescription="Publish circulars and notices. You can also use Communications for message campaigns."
    />
  )
}

export function ExaminationsPage() {
  return (
    <ModulePage
      title="Examinations"
      description="Exam schedules, marks entry, and report cards"
      searchPlaceholder="Search exams..."
      stats={[
        { title: 'Upcoming Exams', value: '—', icon: FiFileText },
        { title: 'Results Pending', value: '—', icon: FiClipboard },
        { title: 'Published', value: '—', icon: FiBarChart2, color: 'success' },
      ]}
      emptyTitle="Exams module ready"
      emptyDescription="Schedule exams, enter marks, and publish results — LMS_School layout."
    />
  )
}

export function FeesPage() {
  return (
    <ModulePage
      title="Fees"
      description="Fee structures, invoices, collections, and receipts"
      searchPlaceholder="Search invoices or students..."
      stats={[
        { title: 'Collected', value: '—', icon: FiCreditCard, color: 'success' },
        { title: 'Pending', value: '—', icon: FiClipboard, color: 'warning' },
        { title: 'Overdue', value: '—', icon: FiFileText, color: 'accent' },
      ]}
      emptyTitle="Fees module ready"
      emptyDescription="Configure fee structures and track payments for the academic year."
    />
  )
}

export function TransportPage() {
  return (
    <ModulePage
      title="Transport"
      description="Routes, vehicles, pick-up points, and student assignments"
      searchPlaceholder="Search routes or vehicles..."
      stats={[
        { title: 'Active Routes', value: '—', icon: FiTruck },
        { title: 'Vehicles', value: '—', icon: FiLayers },
        { title: 'Students Assigned', value: '—', icon: FiUsers },
      ]}
      emptyTitle="Transport module ready"
      emptyDescription="Manage fleet and routes. School masters already include transport route and pickup point data."
    />
  )
}

export function LibraryPage() {
  return (
    <ModulePage
      title="Library"
      description="Books, issue / return, and member records"
      searchPlaceholder="Search books or members..."
      stats={[
        { title: 'Total Books', value: '—', icon: FiBookOpen },
        { title: 'Issued', value: '—', icon: FiBook },
        { title: 'Overdue', value: '—', icon: FiClipboard, color: 'warning' },
      ]}
      emptyTitle="Library module ready"
      emptyDescription="Catalog books and manage issue/return workflows."
    />
  )
}

export function ReportsPage() {
  return (
    <ModulePage
      title="Reports"
      description="Academic, attendance, fee, and admissions analytics"
      searchPlaceholder="Search reports..."
      showToolbar={false}
      actions={null}
      stats={[
        { title: 'Academic', value: '—', icon: FiBarChart2 },
        { title: 'Attendance', value: '—', icon: FiCalendar },
        { title: 'Fees', value: '—', icon: FiCreditCard },
        { title: 'Admissions', value: '—', icon: FiUsers },
      ]}
      emptyTitle="Reports module ready"
      emptyDescription="Export and view school performance reports across modules."
    />
  )
}

export function LmsCoursesPage() {
  return (
    <ModulePage
      title="LMS Courses"
      description="Course catalog, content, and learner enrollment"
      searchPlaceholder="Search courses..."
      stats={[
        { title: 'Published Courses', value: '—', icon: FiBookOpen },
        { title: 'Enrolled Learners', value: '—', icon: FiUsers },
        { title: 'In Progress', value: '—', icon: FiLayers },
      ]}
      emptyTitle="Courses module ready"
      emptyDescription="Create and manage digital courses — same LMS_School Courses layout."
    />
  )
}

export function LmsAssignmentsPage() {
  return (
    <ModulePage
      title="LMS Assignments"
      description="Course assignments, submissions, and grading"
      searchPlaceholder="Search assignments..."
      stats={[
        { title: 'Open Assignments', value: '—', icon: FiClipboard },
        { title: 'Submissions', value: '—', icon: FiFileText },
        { title: 'To Grade', value: '—', icon: FiBook, color: 'warning' },
      ]}
      emptyTitle="Assignments module ready"
      emptyDescription="Assign coursework and review learner submissions."
    />
  )
}
