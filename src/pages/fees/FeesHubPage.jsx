import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiDollarSign,
  FiCreditCard,
  FiAlertCircle,
  FiFileText,
  FiUsers,
  FiDownload,
  FiPlus,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { feesService, academicYearService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { downloadBlob } from '@/utils/format'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const QUICK_LINKS = [
  { to: '/fees/collect', label: 'Collect Payment', icon: FiCreditCard, desc: 'Counter / online collection' },
  { to: '/fees/assign', label: 'Assign Fees', icon: FiPlus, desc: 'Student / section / template' },
  { to: '/students', label: 'Students', icon: FiUsers, desc: 'SIS identity SoT' },
  { to: '/fees/defaulters', label: 'Defaulters', icon: FiAlertCircle, desc: 'Overdue analysis' },
]

export default function FeesHubPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const dashQuery = useQuery({
    queryKey: ['fees-dashboard', schoolId],
    queryFn: () => feesService.dashboard(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId) || user?.is_super_admin || user?.is_org_admin,
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Management & Billing"
        description="Enterprise billing engine — templates, invoices, payments, concessions & scholarships. Not accounting or payroll."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/fees/collect">
              <Button variant="primary"><FiCreditCard className="h-4 w-4" /> Collect</Button>
            </Link>
            <Button
              variant="excel"
              onClick={async () => {
                const blob = await feesService.exportCollections(schoolId ? { school: schoolId } : {})
                downloadBlob(blob, 'fee-collections.csv')
                toast.success('Export downloaded')
              }}
            >
              <FiDownload className="h-4 w-4" /> Export
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Collected" value={dash.total_collected ?? '—'} icon={FiDollarSign} color="success" />
        <StatCard title="Outstanding" value={dash.outstanding ?? '—'} icon={FiFileText} />
        <StatCard title="Overdue" value={dash.overdue ?? '—'} icon={FiAlertCircle} color="warning" />
        <StatCard title="Pending Invoices" value={String(dash.pending_invoices ?? '—')} icon={FiCreditCard} />
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

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Active Scholarships" value={String(dash.scholarship_awards ?? '—')} icon={FiUsers} />
        <StatCard title="Pending Concessions" value={String(dash.concessions_pending ?? '—')} icon={FiFileText} color="warning" />
      </div>
    </div>
  )
}

export function FeesCollectPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const [studentId, setStudentId] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('cash')

  const payMut = useMutation({
    mutationFn: () => feesService.recordPayment({
      student_id: studentId,
      invoice_id: invoiceId || undefined,
      amount,
      payment_mode: mode,
      ...(schoolId ? { school_id: schoolId } : {}),
    }),
    onSuccess: (res) => {
      const d = unwrap(res)
      toast.success(`Receipt ${d.receipt?.receipt_number || 'issued'}`)
      setAmount('')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collect Payment"
        description="Record counter or online payment against student invoice"
        actions={<Link to="/fees"><Button variant="secondary">Back</Button></Link>}
      />
      <Card className="max-w-lg space-y-4 p-5">
        <Input label="Student ID (UUID)" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <Input label="Invoice ID (optional)" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} />
        <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <SelectField
          label="Payment mode"
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          options={[
            { label: 'Cash', value: 'cash' },
            { label: 'UPI', value: 'upi' },
            { label: 'Card', value: 'card' },
            { label: 'Online Gateway', value: 'online_gateway' },
          ]}
        />
        <Button variant="primary" disabled={!studentId || !amount || payMut.isPending} onClick={() => payMut.mutate()}>
          Record payment
        </Button>
      </Card>
    </div>
  )
}

export function FeesAssignPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined
  const [studentId, setStudentId] = useState('')
  const [yearId, setYearId] = useState('')
  const [headId, setHeadId] = useState('')
  const [amount, setAmount] = useState('')

  const yearsQuery = useQuery({
    queryKey: ['academic-years-fees', schoolId],
    queryFn: () => academicYearService.list(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId),
  })
  const headsQuery = useQuery({
    queryKey: ['fee-heads', schoolId],
    queryFn: () => feesService.heads(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId),
  })

  const years = useMemo(() => {
    const d = unwrap(yearsQuery.data)
    return d.results || d || []
  }, [yearsQuery.data])
  const heads = useMemo(() => {
    const d = unwrap(headsQuery.data)
    return d.results || []
  }, [headsQuery.data])

  const assignMut = useMutation({
    mutationFn: () => feesService.assign({
      student_id: studentId,
      academic_year_id: yearId,
      fee_head_id: headId,
      amount,
      ...(schoolId ? { school_id: schoolId } : {}),
    }),
    onSuccess: () => {
      toast.success('Fee assigned & invoiced')
      setAmount('')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Fees"
        description="Assign fee head to student — auto-generates invoice when enabled"
        actions={<Link to="/fees"><Button variant="secondary">Back</Button></Link>}
      />
      <Card className="max-w-lg space-y-4 p-5">
        <Input label="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <SelectField
          label="Academic year"
          value={yearId}
          onChange={(e) => setYearId(e.target.value)}
          options={[
            { label: 'Select…', value: '' },
            ...years.map((y) => ({ label: y.name, value: String(y.id) })),
          ]}
        />
        <SelectField
          label="Fee head"
          value={headId}
          onChange={(e) => setHeadId(e.target.value)}
          options={[
            { label: 'Select…', value: '' },
            ...heads.map((h) => ({ label: `${h.name} (${h.code})`, value: String(h.id) })),
          ]}
        />
        <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Button
          variant="primary"
          disabled={!studentId || !yearId || !headId || !amount || assignMut.isPending}
          onClick={() => assignMut.mutate()}
        >
          Assign fee
        </Button>
      </Card>
    </div>
  )
}

export function FeesDefaultersPage() {
  const { user } = useAuth()
  const schoolId = user?.school_id || user?.school || undefined

  const listQuery = useQuery({
    queryKey: ['fee-defaulters', schoolId],
    queryFn: () => feesService.defaulters(schoolId ? { school: schoolId } : {}),
    enabled: Boolean(schoolId),
  })

  const rows = useMemo(() => {
    const d = unwrap(listQuery.data)
    return d.results || []
  }, [listQuery.data])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Defaulters"
        description="Students with overdue invoice balances"
        actions={<Link to="/fees"><Button variant="secondary">Back</Button></Link>}
      />
      <Card className="overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3">Admission #</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Due date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.student_id} className="border-t border-slate-100">
                <td className="px-4 py-2">{r.admission_number}</td>
                <td className="px-4 py-2">{r.name}</td>
                <td className="px-4 py-2">{r.balance_due}</td>
                <td className="px-4 py-2">{r.due_date || '—'}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">No defaulters found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
