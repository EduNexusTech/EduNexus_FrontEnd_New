import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiCheck } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/Feedback'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { feesService, academicYearService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { FEE_MASTER_NAV, FEE_REPORT_LINKS } from '@/config/feeDefinitions'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

function useFeeScope() {
  const schoolScope = useSchoolScopedSelection()
  const [yearId, setYearId] = useState('')
  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope],
  )

  const yearsQuery = useQuery({
    queryKey: ['fee-years', schoolScope.schoolId],
    queryFn: () =>
      academicYearService.list({ school: schoolScope.schoolId, page_size: 100, ordering: '-start_date' }),
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

  return { schoolScope, yearId, setYearId, yearOptions, listConfig }
}

function ScopeField({ schoolScope }) {
  return (
    <SchoolScopeField
      schoolId={schoolScope.schoolId}
      setSchoolId={schoolScope.setSchoolId}
      schoolOptions={schoolScope.schoolOptions}
      selectedSchoolLabel={schoolScope.selectedSchoolLabel}
      schoolLocked={schoolScope.schoolLocked}
      compact
    />
  )
}

export function FeeSettingsPage() {
  const { schoolScope, listConfig } = useFeeScope()
  const queryClient = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: ['fee-settings', schoolScope.schoolId],
    queryFn: () => feesService.getSettings({ school: schoolScope.schoolId }, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })

  const settings = unwrap(settingsQuery.data)
  const [form, setForm] = useState({})

  useEffect(() => {
    if (settings?.id) {
      setForm({
        currency: settings.currency || 'INR',
        default_due_day: settings.default_due_day ?? 10,
        allow_partial_payment: settings.allow_partial_payment ?? true,
        auto_generate_invoices: settings.auto_generate_invoices ?? true,
        auto_apply_late_fee: settings.auto_apply_late_fee ?? true,
        receipt_prefix: settings.receipt_prefix || 'RCP',
        invoice_prefix: settings.invoice_prefix || 'INV',
        gateway_provider: settings.gateway_provider || 'razorpay',
      })
    }
  }, [settings])

  const saveMut = useMutation({
    mutationFn: () =>
      feesService.updateSettings(form, { school: schoolScope.schoolId }, listConfig),
    onSuccess: () => {
      toast.success('Settings saved')
      queryClient.invalidateQueries({ queryKey: ['fee-settings'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Settings' }]} />
      <PageHeader title="Fee Settings" description="School billing defaults, prefixes & gateway" />
      <Card className="max-w-2xl space-y-4 p-5">
        <ScopeField schoolScope={schoolScope} />
        {settingsQuery.isLoading ? <PageLoader /> : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Currency" value={form.currency || ''} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} />
              <Input label="Default due day" type="number" value={form.default_due_day ?? ''} onChange={(e) => setForm((p) => ({ ...p, default_due_day: Number(e.target.value) }))} />
              <Input label="Receipt prefix" value={form.receipt_prefix || ''} onChange={(e) => setForm((p) => ({ ...p, receipt_prefix: e.target.value }))} />
              <Input label="Invoice prefix" value={form.invoice_prefix || ''} onChange={(e) => setForm((p) => ({ ...p, invoice_prefix: e.target.value }))} />
              <SelectField label="Gateway" value={form.gateway_provider || 'razorpay'} onChange={(e) => setForm((p) => ({ ...p, gateway_provider: e.target.value }))} options={[
                { label: 'Razorpay', value: 'razorpay' },
                { label: 'Cashfree', value: 'cashfree' },
                { label: 'PhonePe', value: 'phonepe' },
                { label: 'Paytm', value: 'paytm' },
              ]} />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.allow_partial_payment} onChange={(e) => setForm((p) => ({ ...p, allow_partial_payment: e.target.checked }))} /> Allow partial payment</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.auto_generate_invoices} onChange={(e) => setForm((p) => ({ ...p, auto_generate_invoices: e.target.checked }))} /> Auto-generate invoices on assign</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.auto_apply_late_fee} onChange={(e) => setForm((p) => ({ ...p, auto_apply_late_fee: e.target.checked }))} /> Auto apply late fee rules</label>
            <Button variant="primary" loading={saveMut.isPending} onClick={() => saveMut.mutate()}>Save settings</Button>
          </>
        )}
      </Card>
    </div>
  )
}

export function FeeStructureBuilderPage() {
  const { schoolScope, yearId, setYearId, yearOptions, listConfig } = useFeeScope()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedHeads, setSelectedHeads] = useState({})

  const headsQuery = useQuery({
    queryKey: ['fee-heads-structure', schoolScope.schoolId],
    queryFn: () => feesService.heads({ page_size: 200, is_active: true }, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })
  const { results: heads } = useMemo(() => unwrapList(headsQuery.data), [headsQuery.data])

  useEffect(() => {
    if (!heads?.length) return
    setSelectedHeads((prev) => {
      const next = { ...prev }
      heads.forEach((h) => {
        const id = String(h.id)
        if (!next[id]) {
          next[id] = { selected: false, amount: String(h.default_amount ?? '') }
        }
      })
      return next
    })
  }, [heads])

  const templatesQuery = useQuery({
    queryKey: ['fee-templates', schoolScope.schoolId, yearId],
    queryFn: () => feesService.templates({ academic_year: yearId, page_size: 50 }, listConfig),
    enabled: Boolean(schoolScope.schoolId && yearId),
  })
  const { results: templates } = useMemo(() => unwrapList(templatesQuery.data), [templatesQuery.data])

  const selectedLines = useMemo(
    () =>
      Object.entries(selectedHeads)
        .filter(([, v]) => v.selected && v.amount)
        .map(([fee_head_id, v]) => ({ fee_head_id, amount: v.amount })),
    [selectedHeads],
  )

  const selectedTotal = useMemo(
    () => selectedLines.reduce((sum, l) => sum + Number(l.amount || 0), 0),
    [selectedLines],
  )

  const toggleHead = (headId) => {
    setSelectedHeads((prev) => ({
      ...prev,
      [headId]: { ...prev[headId], selected: !prev[headId]?.selected },
    }))
  }

  const toggleAll = (checked) => {
    setSelectedHeads((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((id) => {
        next[id] = { ...next[id], selected: checked }
      })
      return next
    })
  }

  const setHeadAmount = (headId, amount) => {
    setSelectedHeads((prev) => ({
      ...prev,
      [headId]: { ...prev[headId], amount },
    }))
  }

  const buildMut = useMutation({
    mutationFn: () =>
      feesService.buildTemplate(
        {
          name,
          code: code.toLowerCase().replace(/\s+/g, '_'),
          academic_year_id: yearId,
          scope: 'school',
          effective_from: dueDate || undefined,
          effective_to: endDate || undefined,
          lines: selectedLines,
        },
        listConfig,
      ),
    onSuccess: () => {
      toast.success('Fee structure created')
      queryClient.invalidateQueries({ queryKey: ['fee-templates'] })
      setName('')
      setCode('')
      setSelectedHeads((prev) => {
        const next = { ...prev }
        Object.keys(next).forEach((id) => {
          next[id] = { ...next[id], selected: false }
        })
        return next
      })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const allSelected = heads?.length > 0 && heads.every((h) => selectedHeads[String(h.id)]?.selected)

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Structure Builder' }]} />
      <PageHeader
        title="Fee Structure Builder"
        description="Step 2 — Select fee codes with checkboxes and save as a reusable structure for the academic year"
      />
      <Card className="p-5 space-y-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <ScopeField schoolScope={schoolScope} />
          <SelectField label="Academic year" value={yearId} onChange={(e) => setYearId(e.target.value)} options={yearOptions} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Structure name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Term 1 Fee" />
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="term1_fee" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Due date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <Input label="End date (late fee after this)" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Map fee codes</p>
            {heads?.length ? (
              <label className="flex items-center gap-2 text-xs text-muted">
                <input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} />
                Select all
              </label>
            ) : null}
          </div>

          {!heads?.length && !headsQuery.isLoading ? (
            <p className="text-sm text-amber-700">
              No fee codes yet.{' '}
              <Link to="/fees/masters/heads" className="font-medium text-primary underline">
                Create fee codes first
              </Link>
              .
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 w-12">Map</th>
                  <th className="px-4 py-3">Fee code</th>
                  <th className="px-4 py-3">Default</th>
                  <th className="px-4 py-3 w-36">Amount in structure</th>
                </tr>
              </thead>
              <tbody>
                {(heads || []).map((h) => {
                  const id = String(h.id)
                  const row = selectedHeads[id] || { selected: false, amount: String(h.default_amount ?? '') }
                  return (
                    <tr key={h.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={row.selected} onChange={() => toggleHead(id)} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{h.name}</span>
                        <span className="ml-2 text-muted">({h.code})</span>
                      </td>
                      <td className="px-4 py-3 text-muted">{h.default_amount ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Input
                          type="number"
                          value={row.amount}
                          disabled={!row.selected}
                          onChange={(e) => setHeadAmount(id, e.target.value)}
                          className="w-full"
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {selectedLines.length > 0 ? (
            <p className="text-sm">
              Selected {selectedLines.length} fee code(s) · Total:{' '}
              <strong>{selectedTotal.toLocaleString()}</strong>
            </p>
          ) : null}
        </div>

        <Button
          variant="primary"
          disabled={!name || !code || !selectedLines.length || buildMut.isPending}
          onClick={() => buildMut.mutate()}
        >
          Save fee structure
        </Button>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold">Existing structures</h3>
        <ul className="divide-y divide-border text-sm">
          {(templates || []).length === 0 && <li className="py-3 text-muted">No structures yet.</li>}
          {(templates || []).map((t) => (
            <li key={t.id} className="py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <span>
                  <strong>{t.name}</strong> · {t.code}
                </span>
                <span className="text-muted">{t.lines?.length || 0} fee codes</span>
              </div>
              {t.lines?.length ? (
                <ul className="mt-2 space-y-1 text-xs text-muted">
                  {t.lines.map((line) => (
                    <li key={line.id}>
                      {line.fee_head_name || line.fee_head} — {line.amount}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export function FeePaymentPlansPage() {
  const { schoolScope, yearId, setYearId, yearOptions, listConfig } = useFeeScope()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [planType, setPlanType] = useState('quarterly')
  const [installments, setInstallments] = useState([
    { installment_number: 1, name: 'Term 1', percentage: 25, due_date: '' },
    { installment_number: 2, name: 'Term 2', percentage: 25, due_date: '' },
    { installment_number: 3, name: 'Term 3', percentage: 25, due_date: '' },
    { installment_number: 4, name: 'Term 4', percentage: 25, due_date: '' },
  ])

  const plansQuery = useQuery({
    queryKey: ['payment-plans', schoolScope.schoolId, yearId],
    queryFn: () => feesService.paymentPlans({ academic_year: yearId }, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })
  const plans = unwrap(plansQuery.data)?.results || unwrapList(plansQuery.data).results || []

  const createMut = useMutation({
    mutationFn: () =>
      feesService.createPaymentPlan(
        {
          name,
          code,
          academic_year_id: yearId,
          plan_type: planType,
          installment_count: installments.length,
          installments,
        },
        listConfig,
      ),
    onSuccess: () => {
      toast.success('Payment plan created')
      queryClient.invalidateQueries({ queryKey: ['payment-plans'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Payment Plans' }]} />
      <PageHeader title="Installment / Payment Plans" description="Quarterly, monthly, or custom installment schedules" />
      <Card className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ScopeField schoolScope={schoolScope} />
          <SelectField label="Academic year" value={yearId} onChange={(e) => setYearId(e.target.value)} options={yearOptions} />
          <Input label="Plan name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Code" value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <SelectField label="Plan type" value={planType} onChange={(e) => setPlanType(e.target.value)} options={[
          { label: 'Monthly', value: 'monthly' },
          { label: 'Quarterly', value: 'quarterly' },
          { label: 'Installments', value: 'installment' },
          { label: 'Custom', value: 'custom' },
        ]} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted"><th className="py-2">#</th><th>Name</th><th>%</th><th>Due date</th></tr></thead>
            <tbody>
              {installments.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50">
                  <td className="py-2">{row.installment_number}</td>
                  <td><input className="w-full rounded border px-2 py-1" value={row.name} onChange={(e) => {
                    const next = [...installments]; next[idx].name = e.target.value; setInstallments(next)
                  }} /></td>
                  <td><input type="number" className="w-20 rounded border px-2 py-1" value={row.percentage} onChange={(e) => {
                    const next = [...installments]; next[idx].percentage = Number(e.target.value); setInstallments(next)
                  }} /></td>
                  <td><input type="date" className="rounded border px-2 py-1" value={row.due_date} onChange={(e) => {
                    const next = [...installments]; next[idx].due_date = e.target.value; setInstallments(next)
                  }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="primary" loading={createMut.isPending} onClick={() => createMut.mutate()}>Save payment plan</Button>
      </Card>
      <Card className="p-5">
        <h3 className="mb-3 font-semibold">Existing plans</h3>
        <ul className="space-y-2 text-sm">
          {plans.map((p) => (
            <li key={p.id} className="rounded border px-3 py-2">
              {p.name} · {p.plan_type} · {p.installments?.length || p.installment_count} installments
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export function FeeDiscountConcessionPage() {
  const { schoolScope, listConfig } = useFeeScope()
  const queryClient = useQueryClient()

  const pendingDiscounts = useQuery({
    queryKey: ['applied-discounts-pending', schoolScope.schoolId],
    queryFn: () => feesService.appliedDiscounts({ status: 'pending' }, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })
  const pendingDiscountRows = unwrap(pendingDiscounts.data)?.results || unwrapList(pendingDiscounts.data).results || []

  const pendingConcessions = useQuery({
    queryKey: ['applied-concessions-pending', schoolScope.schoolId],
    queryFn: () => feesService.appliedConcessions({ status: 'pending' }, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })
  const pendingConcessionRows = unwrap(pendingConcessions.data)?.results || unwrapList(pendingConcessions.data).results || []

  const approveDiscountMut = useMutation({
    mutationFn: (id) => feesService.approveDiscount(id, {}, listConfig),
    onSuccess: () => {
      toast.success('Discount approved')
      queryClient.invalidateQueries({ queryKey: ['applied-discounts-pending'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const approveConcessionMut = useMutation({
    mutationFn: (id) => feesService.approveConcession(id, {}, listConfig),
    onSuccess: () => {
      toast.success('Concession approved')
      queryClient.invalidateQueries({ queryKey: ['applied-concessions-pending'] })
      queryClient.invalidateQueries({ queryKey: ['fee-items-collect'] })
      queryClient.invalidateQueries({ queryKey: ['fee-profile-collect'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const refreshConcessionQueueMut = useMutation({
    mutationFn: () => feesService.refreshConcessionQueue(listConfig),
    onSuccess: (res) => {
      const stats = unwrap(res)
      const created = stats?.created ?? 0
      const reopened = stats?.reopened ?? 0
      toast.success(`Queue refreshed (${created} new, ${reopened} re-queued)`)
      queryClient.invalidateQueries({ queryKey: ['applied-concessions-pending'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Discounts & Concessions' }]} />
      <PageHeader
        title="Discount & Concession Engine"
        description="Manage rules and approve pending discounts and concessions"
        actions={
          <div className="flex gap-2">
            <Link to="/fees/masters/discount-rules"><Button variant="outline">Discount rules</Button></Link>
            <Link to="/fees/masters/concession-rules"><Button variant="outline">Concession rules</Button></Link>
          </div>
        }
      />
      <Card className="p-5">
        <h3 className="mb-3 font-semibold">Pending discount approvals</h3>
        {!pendingDiscountRows.length ? <p className="text-sm text-muted">No pending discounts.</p> : (
          <ul className="space-y-2">
            {pendingDiscountRows.map((d) => (
              <li key={d.id} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <span>{d.student_name || d.student} · {d.amount} · {d.discount_type}</span>
                <Button size="sm" variant="primary" onClick={() => approveDiscountMut.mutate(d.id)}>
                  <FiCheck className="h-4 w-4" /> Approve
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Pending concession approvals</h3>
          <Button
            size="sm"
            variant="outline"
            disabled={refreshConcessionQueueMut.isPending}
            onClick={() => refreshConcessionQueueMut.mutate()}
          >
            Scan for pending concessions
          </Button>
        </div>
        <p className="mb-3 text-sm text-muted">
          When a concession rule has &quot;Requires approval&quot;, matching concessions stay pending until you approve them here. After approval, the reduced net fee appears on Collect Fee.
        </p>
        {pendingConcessions.isLoading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : !pendingConcessionRows.length ? (
          <p className="text-sm text-muted">
            No pending concessions. If staff-child concessions were already applied, click &quot;Scan for pending concessions&quot; to re-queue items that require approval.
          </p>
        ) : (
          <ul className="space-y-2">
            {pendingConcessionRows.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 rounded border px-3 py-2 text-sm">
                <span>
                  {[c.student_name, c.admission_number].filter(Boolean).join(' · ')}
                  {' · '}{c.amount}
                  {c.rule_name ? ` · ${c.rule_name}` : ''}
                  {c.structure_name ? ` · ${c.structure_name}` : ''}
                  {c.fee_head_name ? ` · ${c.fee_head_name}` : ''}
                </span>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={approveConcessionMut.isPending}
                  onClick={() => approveConcessionMut.mutate(c.id)}
                >
                  <FiCheck className="h-4 w-4" /> {approveConcessionMut.isPending ? 'Approving…' : 'Approve'}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export function FeeDailyClosingPage() {
  const { schoolScope, listConfig } = useFeeScope()
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    closing_date: today,
    opening_cash: '',
    cash_collected: '',
    cheque_collected: '',
    online_collected: '',
    closing_cash: '',
    notes: '',
  })

  const countersQuery = useQuery({
    queryKey: ['fee-counters', schoolScope.schoolId],
    queryFn: () => feesService.collectionCounters({ page_size: 50 }, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })
  const { results: counters } = useMemo(() => unwrapList(countersQuery.data), [countersQuery.data])

  const saveMut = useMutation({
    mutationFn: () => {
      const cash = Number(form.cash_collected || 0)
      const cheque = Number(form.cheque_collected || 0)
      const online = Number(form.online_collected || 0)
      const total = cash + cheque + online
      const opening = Number(form.opening_cash || 0)
      const closing = Number(form.closing_cash || 0)
      return feesService.createDailyClosing(
        {
          ...form,
          total_collected: total,
          variance: closing - (opening + cash),
          counter_id: form.counter_id || undefined,
        },
        listConfig,
      )
    },
    onSuccess: () => toast.success('Daily closing saved'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Daily Closing' }]} />
      <PageHeader title="Daily Closing Register" description="Counter day-end cash & collection summary" />
      <Card className="max-w-2xl space-y-4 p-5">
        <ScopeField schoolScope={schoolScope} />
        <SelectField label="Counter" value={form.counter_id || ''} onChange={(e) => setForm((p) => ({ ...p, counter_id: e.target.value }))} options={[{ label: '—', value: '' }, ...(counters || []).map((c) => ({ label: c.name, value: String(c.id) }))]} />
        <Input type="date" label="Closing date" value={form.closing_date} onChange={(e) => setForm((p) => ({ ...p, closing_date: e.target.value }))} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Opening cash" type="number" value={form.opening_cash} onChange={(e) => setForm((p) => ({ ...p, opening_cash: e.target.value }))} />
          <Input label="Cash collected" type="number" value={form.cash_collected} onChange={(e) => setForm((p) => ({ ...p, cash_collected: e.target.value }))} />
          <Input label="Cheque collected" type="number" value={form.cheque_collected} onChange={(e) => setForm((p) => ({ ...p, cheque_collected: e.target.value }))} />
          <Input label="Online collected" type="number" value={form.online_collected} onChange={(e) => setForm((p) => ({ ...p, online_collected: e.target.value }))} />
          <Input label="Closing cash in hand" type="number" value={form.closing_cash} onChange={(e) => setForm((p) => ({ ...p, closing_cash: e.target.value }))} />
        </div>
        <Input label="Notes" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
        <Button variant="primary" loading={saveMut.isPending} onClick={() => saveMut.mutate()}>Submit closing</Button>
      </Card>
    </div>
  )
}

export function FeeReportsHubPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Reports' }]} />
      <PageHeader title="Fee Reports" description="Collection, outstanding, registers & analytics" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEE_REPORT_LINKS.map((r) => (
          <Link key={r.key} to={r.path} className="rounded-xl border border-border p-5 transition hover:border-primary/40 hover:shadow-sm">
            <p className="font-semibold">{r.label}</p>
            <p className="mt-1 text-sm text-muted">Open report →</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function FeeDailyCollectionReportPage() {
  const { schoolScope, yearId, setYearId, yearOptions, listConfig } = useFeeScope()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const q = useQuery({
    queryKey: ['report-daily-collection', schoolScope.schoolId, dateFrom, dateTo],
    queryFn: () =>
      feesService.dailyCollectionReport(
        { school: schoolScope.schoolId, date_from: dateFrom, date_to: dateTo },
        listConfig,
      ),
    enabled: Boolean(schoolScope.schoolId),
  })
  const rows = unwrap(q.data)?.results || []
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Reports', href: '/fees/reports' }, { label: 'Daily Collection' }]} />
      <PageHeader title="Daily Collection Report" />
      <Card className="flex flex-wrap gap-4 p-5">
        <ScopeField schoolScope={schoolScope} />
        <Input type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </Card>
      <Card className="p-5">
        {q.isLoading ? <PageLoader /> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs text-muted"><th className="py-2">Date</th><th>Total</th><th>Count</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.date} className="border-b"><td className="py-2">{r.date}</td><td>{r.total}</td><td>{r.count}</td></tr>)}</tbody>
          </table>
        )}
      </Card>
    </div>
  )
}

export function FeeOutstandingReportPage() {
  const { schoolScope, yearId, setYearId, yearOptions, listConfig } = useFeeScope()
  const q = useQuery({
    queryKey: ['report-outstanding', schoolScope.schoolId, yearId],
    queryFn: () =>
      feesService.outstandingReport({ school: schoolScope.schoolId, academic_year: yearId }, listConfig),
    enabled: Boolean(schoolScope.schoolId && yearId),
  })
  const data = unwrap(q.data)
  const rows = data?.results || []
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Reports', href: '/fees/reports' }, { label: 'Outstanding' }]} />
      <PageHeader title="Outstanding Report" />
      <Card className="flex flex-wrap gap-4 p-5">
        <ScopeField schoolScope={schoolScope} />
        <SelectField label="Academic year" value={yearId} onChange={(e) => setYearId(e.target.value)} options={yearOptions} />
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Total outstanding" value={data?.total_outstanding ?? '—'} />
        <StatCard title="Defaulters" value={String(data?.defaulter_count ?? rows.length)} />
      </div>
      <Card className="p-5">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-xs text-muted"><th className="py-2">Student</th><th>Admission</th><th>Outstanding</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.student_id} className="border-b"><td className="py-2">{r.name}</td><td>{r.admission_number}</td><td>{r.outstanding}</td></tr>)}</tbody>
        </table>
      </Card>
    </div>
  )
}

export function FeeCollectionSummaryPage() {
  const { schoolScope, yearId, setYearId, yearOptions, listConfig } = useFeeScope()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const q = useQuery({
    queryKey: ['report-collection-summary', schoolScope.schoolId, yearId, dateFrom, dateTo],
    queryFn: () =>
      feesService.collectionSummary(
        { school: schoolScope.schoolId, academic_year: yearId, date_from: dateFrom, date_to: dateTo },
        listConfig,
      ),
    enabled: Boolean(schoolScope.schoolId),
  })
  const data = unwrap(q.data)
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Reports', href: '/fees/reports' }, { label: 'Collection Summary' }]} />
      <PageHeader title="Collection Summary" />
      <Card className="flex flex-wrap gap-4 p-5">
        <ScopeField schoolScope={schoolScope} />
        <SelectField label="Academic year" value={yearId} onChange={(e) => setYearId(e.target.value)} options={yearOptions} />
        <Input type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </Card>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Collected" value={data?.total_collected ?? '—'} />
        <StatCard title="Outstanding" value={data?.total_outstanding ?? '—'} />
      </div>
      <Card className="p-5">
        <h3 className="mb-3 font-semibold">By payment mode</h3>
        <ul className="space-y-2 text-sm">
          {(data?.by_payment_mode || []).map((m) => (
            <li key={m.payment_mode} className="flex justify-between border-b py-2">
              <span className="capitalize">{m.payment_mode?.replace(/_/g, ' ')}</span>
              <span>{m.total} ({m.count})</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export function FeePaymentMethodsReportPage() {
  const { schoolScope, listConfig } = useFeeScope()
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const q = useQuery({
    queryKey: ['report-payment-methods', schoolScope.schoolId, dateFrom, dateTo],
    queryFn: () =>
      feesService.paymentMethods({ school: schoolScope.schoolId, date_from: dateFrom, date_to: dateTo }, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })
  const rows = unwrap(q.data)?.results || []
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Reports', href: '/fees/reports' }, { label: 'Payment Methods' }]} />
      <PageHeader title="Payment Methods Report" />
      <Card className="flex flex-wrap gap-4 p-5">
        <ScopeField schoolScope={schoolScope} />
        <Input type="date" label="From" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" label="To" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
      </Card>
      <Card className="p-5">
        <ul className="space-y-2 text-sm">
          {rows.map((m) => (
            <li key={m.payment_mode} className="flex justify-between border-b py-2 capitalize">
              {m.payment_mode?.replace(/_/g, ' ')}<span>{m.total}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export function FeeMastersNavPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fee Management', href: '/fees' }, { label: 'Masters' }]} />
      <PageHeader title="Fee Masters" description="Configure categories, heads, rules & counters" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEE_MASTER_NAV.map((m) => (
          <Link key={m.key} to={m.path} className="rounded-xl border border-border p-4 hover:border-primary/40">
            {m.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
