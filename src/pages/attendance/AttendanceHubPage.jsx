import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiBarChart2,
  FiClipboard,
  FiSettings,
  FiDownload,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { attendanceService } from '@/api/services'
import { useAuth } from '@/contexts/AuthContext'
import { downloadBlob } from '@/utils/format'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const QUICK_LINKS = [
  { to: '/attendance/mark', label: 'Mark Attendance', icon: FiClipboard, desc: 'Class-wise daily register' },
  { to: '/attendance/reports', label: 'Daily Reports', icon: FiBarChart2, desc: 'Registers & percentages' },
  { to: '/students', label: 'Students', icon: FiUsers, desc: 'SIS identity SoT' },
  { to: '/staff', label: 'HRMS Employees', icon: FiUserCheck, desc: 'Employee punch & shifts' },
]

export default function AttendanceHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const today = new Date().toISOString().slice(0, 10)
  const [dashDate, setDashDate] = useState(today)

  const dashQuery = useQuery({
    queryKey: ['attendance-dashboard', schoolId, dashDate],
    queryFn: () => attendanceService.dashboard({
      ...(schoolId ? { school: schoolId } : {}),
      date: dashDate,
    }),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Engine"
        description="Reusable platform for student, teacher & employee attendance — not timetable, leave, or payroll"
        actions={
          <div className="flex flex-wrap gap-2">
            <Input type="date" value={dashDate} onChange={(e) => setDashDate(e.target.value)} />
            <Link to="/attendance/mark">
              <Button variant="primary"><FiClipboard className="h-4 w-4" /> Mark class attendance</Button>
            </Link>
            <Button
              variant="excel"
              onClick={async () => {
                const blob = await attendanceService.export(schoolId ? { school: schoolId } : {})
                downloadBlob(blob, 'attendance-export.csv')
                toast.success('Export downloaded')
              }}
            >
              <FiDownload className="h-4 w-4" /> Export
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Marked Today" value={String(dash.total_marked ?? dash.total ?? '—')} icon={FiCalendar} />
        <StatCard title="Present" value={String(dash.present ?? '—')} icon={FiUserCheck} color="success" />
        <StatCard title="Absent" value={String(dash.absent ?? '—')} icon={FiUsers} color="warning" />
        <StatCard title="Rate %" value={dash.attendance_rate != null ? String(dash.attendance_rate) : (dash.attendance_percent != null ? String(dash.attendance_percent) : '—')} icon={FiBarChart2} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Late" value={String(dash.late ?? '—')} icon={FiSettings} />
        <StatCard title="Calendar" value={String(dash.day_calendar ?? dash.day_status ?? '—')} icon={FiCalendar} />
        {Object.entries(dash.by_subject_type || {}).slice(0, 2).map(([k, v]) => (
          <StatCard key={k} title={k} value={String(v)} icon={FiUsers} />
        ))}
      </div>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Quick links</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_LINKS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-xl border border-border p-4 transition hover:border-primary/40 hover:bg-muted/40"
            >
              <item.icon className="mb-2 h-5 w-5 text-primary" />
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-xs text-muted">{item.desc}</p>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function AttendanceReportsPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const reportQuery = useQuery({
    queryKey: ['attendance-daily-report', schoolId, date],
    queryFn: () => attendanceService.reportDaily({
      ...(schoolId ? { school: schoolId } : {}),
      date,
    }),
  })

  const defaultersQuery = useQuery({
    queryKey: ['attendance-defaulters', schoolId],
    queryFn: () => attendanceService.defaulters(schoolId ? { school: schoolId } : {}),
  })

  const report = unwrap(reportQuery.data)
  const defaulters = unwrap(defaultersQuery.data)?.results || []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Reports"
        description="Daily registers, percentages & defaulters"
        actions={
          <>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Link to="/attendance"><Button variant="outline">Hub</Button></Link>
          </>
        }
      />
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Daily summary — {date}</h3>
        <p className="text-sm text-muted">
          Marked: {report.summary?.total_marked ?? report.summary?.total ?? '—'} · Present: {report.summary?.present ?? '—'} ·
          Absent: {report.summary?.absent ?? '—'} · Rate: {report.summary?.attendance_rate ?? report.summary?.attendance_percent ?? '—'}%
        </p>
        <ul className="mt-4 max-h-80 space-y-2 overflow-auto text-sm">
          {(report.results || []).map((r) => (
            <li key={r.record_id} className="rounded-lg border px-3 py-2">
              {r.subject_type} · {r.status_display || r.status} · {r.attendance_date}
              {r.remarks ? ` — ${r.remarks}` : ''}
            </li>
          ))}
        </ul>
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Low attendance (defaulters)</h3>
        <ul className="space-y-2 text-sm">
          {defaulters.length === 0 && <li className="text-muted">No defaulters in range.</li>}
          {defaulters.map((d) => (
            <li key={d.student_id} className="rounded-lg border px-3 py-2">
              {d.name} — {d.attendance_percent}% ({d.present}/{d.total})
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
