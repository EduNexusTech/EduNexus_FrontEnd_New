import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PageHeader } from '@/components/common/PageHeader'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { feesService, academicYearService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { listActiveClassSections } from '@/api/activeClassSections'
import { mapClassSectionOptions, sortClassSections, classSectionLabel } from '@/utils/classSections'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { FeeReceiptActions } from '@/components/fees/FeeReceiptModal'
import FeeStudentSummaryCard from '@/components/fees/FeeStudentSummaryCard'
import { StudentSearchBar, StudentSearchCandidates } from '@/components/fees/StudentSearchBar'
import { useStudentLookup } from '@/hooks/useStudentLookup'
import { parseStudentLookupKey } from '@/utils/studentSearch'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

function getPaymentReferenceConfig(mode) {
  if (mode === 'cash') return null
  if (mode === 'cheque' || mode === 'demand_draft') {
    return {
      label: mode === 'cheque' ? 'Cheque number' : 'DD number',
      placeholder: mode === 'cheque' ? 'Enter cheque number' : 'Enter demand draft number',
      required: true,
    }
  }
  const labels = {
    upi: 'UPI transaction ID / UTR',
    card: 'Card transaction ID / auth code',
    online_gateway: 'Gateway transaction ID',
    net_banking: 'Net banking reference',
    bank_transfer: 'Bank transfer reference',
    wallet: 'Wallet transaction ID',
  }
  return {
    label: labels[mode] || 'Transaction ID / reference',
    placeholder: 'Enter payment transaction reference',
    required: true,
  }
}

export function FeesCollectPage() {
  const schoolScope = useSchoolScopedSelection()
  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope],
  )

  const [yearId, setYearId] = useState('')
  const [invoiceId, setInvoiceId] = useState('')
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState('cash')
  const [paymentRef, setPaymentRef] = useState('')

  const studentLookup = useStudentLookup({
    schoolId: schoolScope.schoolId,
    yearId,
    listConfig,
    queryKeyPrefix: 'student-adm-collect',
  })
  const {
    admissionNo,
    setAdmissionNo,
    studentName,
    setStudentName,
    lookupKey,
    searchCandidates,
    searching,
    handleSearch,
    selectCandidate,
    clearLookup,
    student,
    studentId,
    studentQuery,
  } = studentLookup

  const paymentRefConfig = useMemo(() => getPaymentReferenceConfig(mode), [mode])

  useEffect(() => {
    setPaymentRef('')
  }, [mode])

  const yearsQuery = useQuery({
    queryKey: ['academic-years-collect', schoolScope.schoolId],
    queryFn: () => academicYearService.list({ school: schoolScope.schoolId, page_size: 100, ordering: '-start_date' }),
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

  const profileQuery = useQuery({
    queryKey: ['fee-profile-collect', studentId, yearId],
    queryFn: () =>
      feesService.studentProfile(
        { school: schoolScope.schoolId, student: studentId, academic_year: yearId },
        listConfig,
      ),
    enabled: Boolean(studentId && yearId && schoolScope.schoolId),
  })

  const invoicesQuery = useQuery({
    queryKey: ['fee-invoices-collect', studentId, yearId],
    queryFn: () =>
      feesService.invoices(
        {
          school: schoolScope.schoolId,
          student: studentId,
          academic_year: yearId,
          page_size: 100,
        },
        listConfig,
      ),
    enabled: Boolean(studentId && yearId && schoolScope.schoolId),
  })

  const profile = useMemo(() => unwrap(profileQuery.data), [profileQuery.data])

  const studentDisplay = useMemo(() => {
    if (!student && !profile?.full_name) return null
    return {
      ...profile,
      ...student,
      full_name: student?.full_name || profile?.full_name,
      admission_number: student?.admission_number || profile?.admission_number,
      photo_url: student?.photo_url || profile?.photo_url,
      class_name: student?.class_name || profile?.class_name,
      section_name: student?.section_name || profile?.section_name,
      mobile_number: student?.mobile_number || profile?.mobile_number,
      father_name: profile?.father_name || student?.father_name,
      father_mobile: profile?.father_mobile || student?.father_mobile,
      mother_name: profile?.mother_name || student?.mother_name,
      mother_mobile: profile?.mother_mobile || student?.mother_mobile,
    }
  }, [student, profile])
  const invoices = useMemo(() => {
    const { results } = unwrapList(invoicesQuery.data)
    return (results || []).filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled')
  }, [invoicesQuery.data])

  const invoiceOptions = useMemo(
    () => [
      { label: 'General payment (no invoice)', value: '' },
      ...invoices.map((inv) => ({
        label: `${inv.invoice_number} — balance ${inv.balance_due} (${inv.status})`,
        value: String(inv.id),
      })),
    ],
    [invoices],
  )

  useEffect(() => {
    if (!invoiceId) return
    const inv = invoices.find((i) => String(i.id) === invoiceId)
    if (inv?.balance_due != null) {
      setAmount(String(inv.balance_due))
    }
  }, [invoiceId, invoices])

  const handleFindStudent = async () => {
    setInvoiceId('')
    setAmount('')
    setPaymentRef('')
    await handleSearch()
  }

  const handleRecordPayment = () => {
    if (!amount) {
      toast.error('Enter payment amount')
      return
    }
    if (paymentRefConfig?.required && !paymentRef.trim()) {
      toast.error(`Enter ${paymentRefConfig.label.toLowerCase()}`)
      return
    }
    payMut.mutate()
  }

  const payMut = useMutation({
    mutationFn: () =>
      feesService.recordPayment(
        {
          student_id: studentId,
          invoice_id: invoiceId || undefined,
          amount,
          payment_mode: mode,
          transaction_ref: paymentRef.trim() || undefined,
          school_id: schoolScope.schoolId,
        },
        listConfig,
      ),
    onSuccess: (res) => {
      toast.success(`Receipt ${unwrap(res).receipt?.receipt_number || 'issued'}`)
      setAmount('')
      setInvoiceId('')
      setPaymentRef('')
      profileQuery.refetch()
      invoicesQuery.refetch()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collect Payment"
        description="Step 3 — Search by admission number or name, then record payment"
        actions={<Link to="/fees"><Button variant="secondary">Back</Button></Link>}
      />

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end xl:flex-nowrap">
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
              onChange={(e) => {
                setYearId(e.target.value)
                clearLookup()
                setInvoiceId('')
              }}
              options={[{ label: 'Select…', value: '' }, ...yearOptions]}
              required
            />
          </div>
          <StudentSearchBar
            admissionNo={admissionNo}
            studentName={studentName}
            onAdmissionNoChange={setAdmissionNo}
            onStudentNameChange={setStudentName}
            onSearch={handleFindStudent}
            searching={searching}
            searchDisabled={
              (!admissionNo.trim() && !studentName.trim()) || !yearId || searching
            }
          />
        </div>

        <StudentSearchCandidates candidates={searchCandidates} onSelect={selectCandidate} />

        {studentQuery.isError && lookupKey ? (
          <p className="mt-3 text-sm text-red-600">{getErrorMessage(studentQuery.error)}</p>
        ) : null}

        {studentDisplay ? (
          <FeeStudentSummaryCard
            student={studentDisplay}
            outstanding={profile.outstanding}
            className="mt-4"
          />
        ) : null}

        {studentId ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Invoice (optional)"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              options={invoiceOptions}
            />
            <Input
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <SelectField
              label="Payment mode"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              options={[
                { label: 'Cash', value: 'cash' },
                { label: 'UPI', value: 'upi' },
                { label: 'Card', value: 'card' },
                { label: 'Cheque', value: 'cheque' },
                { label: 'Demand Draft', value: 'demand_draft' },
                { label: 'Online Gateway', value: 'online_gateway' },
              ]}
            />
            {paymentRefConfig ? (
              <Input
                label={paymentRefConfig.label}
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder={paymentRefConfig.placeholder}
                required={paymentRefConfig.required}
              />
            ) : (
              <div className="hidden sm:block" aria-hidden />
            )}
            <div className="flex items-end sm:col-span-2">
              <Button
                variant="primary"
                className="w-full sm:w-auto"
                disabled={!amount || payMut.isPending}
                onClick={handleRecordPayment}
              >
                Record payment
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  )
}

export function FeesGeneratePage() {
  const schoolScope = useSchoolScopedSelection()
  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope],
  )

  const [mode, setMode] = useState('student')
  const [yearId, setYearId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [headId, setHeadId] = useState('')
  const [amount, setAmount] = useState('')

  const studentLookup = useStudentLookup({
    schoolId: schoolScope.schoolId,
    yearId,
    listConfig,
    queryKeyPrefix: 'student-adm-generate',
  })
  const {
    admissionNo,
    setAdmissionNo,
    studentName,
    setStudentName,
    lookupKey,
    searchCandidates,
    searching,
    handleSearch,
    selectCandidate,
    clearLookup,
    student,
    studentId,
    studentQuery,
  } = studentLookup

  const yearsQuery = useQuery({
    queryKey: ['academic-years-generate', schoolScope.schoolId],
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

  const headsQuery = useQuery({
    queryKey: ['fee-heads-generate', schoolScope.schoolId],
    queryFn: () => feesService.heads({ ...listConfig.params, page_size: 200, is_active: true }, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })

  const heads = useMemo(() => {
    const { results } = unwrapList(headsQuery.data)
    return results || []
  }, [headsQuery.data])

  const sectionsQuery = useQuery({
    queryKey: ['class-sections-generate', schoolScope.schoolId, yearId],
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
    () =>
      sortClassSections(sections).map((cs) => {
        const count = cs.enrolled_count ?? cs.strength
        const strength = count != null ? ` (${count} students)` : ''
        return {
          label: `${classSectionLabel(cs)}${strength}`,
          value: String(cs.id),
        }
      }),
    [sections],
  )

  const selectedSection = useMemo(
    () => sections.find((cs) => String(cs.id) === sectionId),
    [sections, sectionId],
  )

  const profileQuery = useQuery({
    queryKey: ['fee-profile-generate', studentId, yearId],
    queryFn: () =>
      feesService.studentProfile(
        { school: schoolScope.schoolId, student: studentId, academic_year: yearId },
        listConfig,
      ),
    enabled: Boolean(studentId && yearId && schoolScope.schoolId && mode === 'student'),
  })

  const profile = useMemo(() => unwrap(profileQuery.data), [profileQuery.data])

  const studentDisplay = useMemo(() => {
    if (!student && !profile?.full_name) return null
    return {
      ...profile,
      ...student,
      full_name: student?.full_name || profile?.full_name,
      admission_number: student?.admission_number || profile?.admission_number,
      photo_url: student?.photo_url || profile?.photo_url,
      class_name: student?.class_name || profile?.class_name,
      section_name: student?.section_name || profile?.section_name,
      mobile_number: student?.mobile_number || profile?.mobile_number,
      father_name: profile?.father_name,
      father_mobile: profile?.father_mobile,
      mother_name: profile?.mother_name,
      mother_mobile: profile?.mother_mobile,
    }
  }, [student, profile])

  const headOptions = useMemo(
    () => [
      { label: 'Select fee code…', value: '' },
      ...heads.map((h) => ({
        label: `${h.name} (${h.code}) — ${h.default_amount ?? 0}`,
        value: String(h.id),
      })),
    ],
    [heads],
  )

  useEffect(() => {
    if (!headId) return
    const head = heads.find((h) => String(h.id) === headId)
    if (head?.default_amount != null) {
      setAmount(String(head.default_amount))
    }
  }, [headId, heads])

  const handleFindStudent = async () => {
    await handleSearch()
  }

  const generateMut = useMutation({
    mutationFn: () => {
      const payload = {
        academic_year_id: yearId,
        fee_head_id: headId,
        amount,
        school_id: schoolScope.schoolId,
      }
      if (mode === 'class') {
        return feesService.assign({ ...payload, class_section_id: sectionId }, listConfig)
      }
      return feesService.assign({ ...payload, student_id: studentId }, listConfig)
    },
    onSuccess: (res) => {
      const data = unwrap(res)
      const count = data?.results?.length ?? (mode === 'student' ? 1 : 0)
      if (mode === 'class') {
        toast.success(
          count
            ? `Fee generated for ${count} student(s) in class`
            : 'No active students found in this class for the selected year',
        )
      } else {
        toast.success('Fee generated — invoice created for student')
      }
      setHeadId('')
      setAmount('')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const canGenerateStudent = mode === 'student' && studentId && headId && amount
  const canGenerateClass = mode === 'class' && sectionId && headId && amount && yearId

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Fees"
        description="Step 2 — Search student by admission number or name, or generate for a class"
        actions={<Link to="/fees"><Button variant="secondary">Back</Button></Link>}
      />

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode('student')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === 'student'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Student wise
          </button>
          <button
            type="button"
            onClick={() => setMode('class')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              mode === 'class'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Class wise
          </button>
        </div>

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
              onChange={(e) => {
                setYearId(e.target.value)
                clearLookup()
                setSectionId('')
              }}
              options={[{ label: 'Select…', value: '' }, ...yearOptions]}
              required
            />
          </div>

          {mode === 'student' ? (
            <StudentSearchBar
              admissionNo={admissionNo}
              studentName={studentName}
              onAdmissionNoChange={setAdmissionNo}
              onStudentNameChange={setStudentName}
              onSearch={handleFindStudent}
              searching={searching}
              searchDisabled={
                (!admissionNo.trim() && !studentName.trim()) || !yearId || searching
              }
            />
          ) : (
            <div className="w-full min-w-[14rem] lg:w-auto lg:min-w-[16rem] lg:flex-[1.5]">
              <SelectField
                label="Class & section"
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                options={[{ label: 'Select class…', value: '' }, ...sectionOptions]}
                disabled={!yearId || sectionsQuery.isLoading}
              />
            </div>
          )}
        </div>

        {mode === 'student' ? (
          <StudentSearchCandidates candidates={searchCandidates} onSelect={selectCandidate} />
        ) : null}

        {mode === 'student' && studentQuery.isError && lookupKey ? (
          <p className="mt-3 text-sm text-red-600">{getErrorMessage(studentQuery.error)}</p>
        ) : null}

        {mode === 'student' && studentDisplay ? (
          <FeeStudentSummaryCard student={studentDisplay} className="mt-4" />
        ) : null}

        {mode === 'class' && selectedSection ? (
          <div className="mt-4 rounded-xl border border-border bg-slate-50/80 p-4 text-sm">
            <p className="font-semibold text-slate-900">
              {selectedSection.class_name} — {selectedSection.section_name}
            </p>
            <p className="text-muted">
              {(selectedSection.enrolled_count ?? selectedSection.strength) != null
                ? `${selectedSection.enrolled_count ?? selectedSection.strength} active student(s) in this class`
                : 'Fee will be generated for all active students in this class'}
            </p>
          </div>
        ) : null}

        {mode === 'class' && yearId && !sectionsQuery.isLoading && !sections.length ? (
          <p className="mt-3 text-sm text-amber-700">
            No active classes for this year. Activate classes under Academics → Active Classes first.
          </p>
        ) : null}

        {(mode === 'class' || studentId) ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label="Fee code"
              value={headId}
              onChange={(e) => setHeadId(e.target.value)}
              options={headOptions}
            />
            <Input
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex items-end">
              <Button
                variant="primary"
                className="w-full"
                disabled={
                  !(canGenerateStudent || canGenerateClass) || generateMut.isPending
                }
                onClick={() => generateMut.mutate()}
              >
                {mode === 'class' ? 'Generate for class' : 'Generate fee'}
              </Button>
            </div>
          </div>
        ) : null}

        {!heads.length && schoolScope.schoolId && !headsQuery.isLoading ? (
          <p className="mt-4 text-sm text-amber-700">
            No fee codes yet.{' '}
            <Link to="/fees/masters/heads" className="font-medium text-primary underline">
              Create fee codes first
            </Link>
            .
          </p>
        ) : null}
      </Card>
    </div>
  )
}

/** @deprecated use FeesGeneratePage */
export const FeesAssignPage = FeesGeneratePage

function LedgerTable({ columns, rows, emptyMessage, rowActions }) {
  const allColumns = rowActions
    ? [...columns, { key: '_actions', label: 'Actions', render: rowActions }]
    : columns
  return (
    <table className="min-w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-600">
        <tr>
          {allColumns.map((col) => (
            <th key={col.key} className="px-4 py-3">{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={row.id || row.entity_id || idx} className="border-t border-slate-100">
            {allColumns.map((col) => (
              <td key={col.key} className="px-4 py-2">{col.render ? col.render(row) : row[col.key] ?? '—'}</td>
            ))}
          </tr>
        ))}
        {!rows.length && (
          <tr>
            <td colSpan={allColumns.length} className="px-4 py-8 text-center text-slate-500">{emptyMessage}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

function SummaryTile({ label, value, tone = 'default' }) {
  const tones = {
    default: 'border-slate-200 bg-white',
    danger: 'border-red-200 bg-red-50/60',
    success: 'border-emerald-200 bg-emerald-50/60',
  }
  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || tones.default}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value ?? '—'}</p>
    </div>
  )
}

export function FeesLedgerPage() {
  const schoolScope = useSchoolScopedSelection()
  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope],
  )

  const [yearId, setYearId] = useState('')
  const [activeTab, setActiveTab] = useState('transactions')

  const studentLookup = useStudentLookup({
    schoolId: schoolScope.schoolId,
    yearId,
    listConfig,
    queryKeyPrefix: 'student-adm-ledger',
  })
  const {
    admissionNo,
    setAdmissionNo,
    studentName,
    setStudentName,
    lookupKey,
    searchCandidates,
    searching,
    handleSearch,
    selectCandidate,
    clearLookup,
    studentQuery,
  } = studentLookup

  const yearsQuery = useQuery({
    queryKey: ['academic-years-ledger', schoolScope.schoolId],
    queryFn: () => academicYearService.list({ school: schoolScope.schoolId, page_size: 100, ordering: '-start_date' }),
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

  const ledgerQuery = useQuery({
    queryKey: ['fee-ledger', schoolScope.schoolId, lookupKey],
    enabled: Boolean(schoolScope.schoolId && lookupKey),
    retry: false,
    queryFn: async () => {
      const parsed = parseStudentLookupKey(lookupKey)
      if (!parsed?.studentId) {
        throw new Error('Invalid student lookup.')
      }
      const res = await feesService.studentLedger(
        {
          school: schoolScope.schoolId,
          student: parsed.studentId,
          academic_year: parsed.yearId,
        },
        listConfig,
      )
      return unwrap(res)
    },
  })

  const handleFindStudent = async () => {
    setActiveTab('transactions')
    await handleSearch()
  }

  const ledger = ledgerQuery.data
  const summary = ledger?.summary || {}
  const tabs = [
    { key: 'transactions', label: 'All Transactions' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'payments', label: 'Payments' },
    { key: 'receipts', label: 'Receipts' },
    { key: 'refunds', label: 'Refunds' },
  ]

  const renderReceiptActions = (row) => (
    <FeeReceiptActions
      receiptId={row.receipt_id || row.id}
      receiptNumber={row.receipt_number}
      schoolId={schoolScope.schoolId}
      listConfig={listConfig}
      compact
    />
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Ledger"
        description="Step 4 — Search by admission number or name to view fee summary and transactions"
        actions={<Link to="/fees"><Button variant="secondary">Back</Button></Link>}
      />

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end xl:flex-nowrap">
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
              onChange={(e) => {
                setYearId(e.target.value)
                clearLookup()
              }}
              options={[{ label: 'Select…', value: '' }, ...yearOptions]}
              required
            />
          </div>

          <StudentSearchBar
            admissionNo={admissionNo}
            studentName={studentName}
            onAdmissionNoChange={setAdmissionNo}
            onStudentNameChange={setStudentName}
            onSearch={handleFindStudent}
            searching={searching || ledgerQuery.isFetching}
            searchDisabled={
              (!admissionNo.trim() && !studentName.trim()) || !yearId || searching || ledgerQuery.isFetching
            }
            buttonLabel="Search"
          />
        </div>

        <StudentSearchCandidates candidates={searchCandidates} onSelect={selectCandidate} />

        {(studentQuery.isError || ledgerQuery.isError) && lookupKey ? (
          <p className="mt-3 text-sm text-red-600">
            {getErrorMessage(studentQuery.error || ledgerQuery.error)}
          </p>
        ) : null}
      </Card>

      {ledger?.student ? (
        <>
          <Card className="p-5">
            <FeeStudentSummaryCard
              student={ledger.student}
              academicYearName={ledger.academic_year?.name}
              outstanding={summary.outstanding}
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryTile label="Total assigned" value={summary.total_assigned} />
              <SummaryTile label="Total invoiced" value={summary.total_invoiced} />
              <SummaryTile label="Total paid" value={summary.total_paid} tone="success" />
              <SummaryTile label="Outstanding" value={summary.outstanding} tone="danger" />
            </div>
            {(summary.total_concession !== '0.00' || summary.total_scholarship !== '0.00' || summary.total_refunded !== '0.00') ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <SummaryTile label="Concessions" value={summary.total_concession} />
                <SummaryTile label="Scholarships" value={summary.total_scholarship} />
                <SummaryTile label="Refunded" value={summary.total_refunded} />
              </div>
            ) : null}
          </Card>

          <Card className="overflow-hidden">
            <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50/80 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              {activeTab === 'transactions' ? (
                <LedgerTable
                  emptyMessage="No transactions for this student and academic year."
                  columns={[
                    { key: 'date', label: 'Date' },
                    { key: 'type', label: 'Type', render: (r) => r.type?.replace('_', ' ') },
                    { key: 'reference', label: 'Reference' },
                    { key: 'description', label: 'Description' },
                    { key: 'debit', label: 'Debit (Dr)', render: (r) => r.debit || '—' },
                    { key: 'credit', label: 'Credit (Cr)', render: (r) => r.credit || '—' },
                    { key: 'balance', label: 'Balance' },
                    { key: 'status', label: 'Status' },
                  ]}
                  rows={ledger.transactions || []}
                />
              ) : null}

              {activeTab === 'assignments' ? (
                <LedgerTable
                  emptyMessage="No fee assignments found."
                  columns={[
                    { key: 'fee_head_name', label: 'Fee head' },
                    { key: 'label', label: 'Label' },
                    { key: 'net_amount', label: 'Net amount' },
                    { key: 'paid_amount', label: 'Paid' },
                    { key: 'due_date', label: 'Due date' },
                    { key: 'status', label: 'Status' },
                  ]}
                  rows={ledger.assignments || []}
                />
              ) : null}

              {activeTab === 'invoices' ? (
                <LedgerTable
                  emptyMessage="No invoices found."
                  columns={[
                    { key: 'invoice_number', label: 'Invoice #' },
                    { key: 'issue_date', label: 'Issue date' },
                    { key: 'due_date', label: 'Due date' },
                    { key: 'total_amount', label: 'Total' },
                    { key: 'paid_amount', label: 'Paid' },
                    { key: 'balance_due', label: 'Balance' },
                    { key: 'status', label: 'Status' },
                  ]}
                  rows={ledger.invoices || []}
                />
              ) : null}

              {activeTab === 'payments' ? (
                <LedgerTable
                  emptyMessage="No payments found."
                  columns={[
                    { key: 'payment_number', label: 'Payment #' },
                    { key: 'paid_at', label: 'Paid at', render: (r) => (r.paid_at ? String(r.paid_at).slice(0, 16).replace('T', ' ') : '—') },
                    { key: 'amount', label: 'Amount' },
                    { key: 'payment_mode', label: 'Mode' },
                    { key: 'transaction_ref', label: 'Ref' },
                    { key: 'receipt_number', label: 'Receipt' },
                    { key: 'status', label: 'Status' },
                  ]}
                  rows={ledger.payments || []}
                  rowActions={renderReceiptActions}
                />
              ) : null}

              {activeTab === 'receipts' ? (
                <LedgerTable
                  emptyMessage="No receipts found."
                  columns={[
                    { key: 'receipt_number', label: 'Receipt #' },
                    { key: 'issued_at', label: 'Issued at', render: (r) => (r.issued_at ? String(r.issued_at).slice(0, 16).replace('T', ' ') : '—') },
                    { key: 'amount', label: 'Amount' },
                  ]}
                  rows={ledger.receipts || []}
                  rowActions={renderReceiptActions}
                />
              ) : null}

              {activeTab === 'refunds' ? (
                <LedgerTable
                  emptyMessage="No refunds found."
                  columns={[
                    { key: 'refund_number', label: 'Refund #' },
                    { key: 'amount', label: 'Amount' },
                    { key: 'status', label: 'Status' },
                    { key: 'reason', label: 'Reason' },
                    { key: 'processed_at', label: 'Processed', render: (r) => r.processed_at || '—' },
                  ]}
                  rows={ledger.refunds || []}
                />
              ) : null}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  )
}

export function FeesDefaultersPage() {
  const schoolScope = useSchoolScopedSelection()
  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope],
  )

  const listQuery = useQuery({
    queryKey: ['fee-defaulters', schoolScope.schoolId],
    queryFn: () => feesService.defaulters(listConfig.params, listConfig),
    enabled: Boolean(schoolScope.schoolId),
  })

  const rows = useMemo(() => unwrap(listQuery.data).results || [], [listQuery.data])

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
