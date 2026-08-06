import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiCreditCard } from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import SchoolScopeField from '@/components/forms/SchoolScopeField'
import { feesService, academicYearService } from '@/api/services'
import { getErrorMessage, unwrapList } from '@/api/client'
import { listActiveClassSections } from '@/api/activeClassSections'
import { sortClassSections, classSectionLabel } from '@/utils/classSections'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'
import { FeeReceiptActions } from '@/components/fees/FeeReceiptModal'
import { FeeStructureInvoiceActions } from '@/components/fees/FeeStructureInvoiceModal'
import FeeStructureCompletionPanel from '@/components/fees/FeeStructureCompletionPanel'
import FeeStudentSummaryCard from '@/components/fees/FeeStudentSummaryCard'
import { StudentSearchBar, StudentSearchCandidates } from '@/components/fees/StudentSearchBar'
import { useStudentLookup } from '@/hooks/useStudentLookup'
import { buildStudentLookupKey, parseStudentLookupKey } from '@/utils/studentSearch'

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

const STATUS_BADGE = {
  paid: 'bg-emerald-100 text-emerald-800',
  partial: 'bg-amber-100 text-amber-800',
  unpaid: 'bg-red-100 text-red-800',
  overdue: 'bg-red-200 text-red-900',
  none: 'bg-slate-100 text-slate-600',
}

function FeeSummaryTiles({ summary }) {
  if (!summary) return null
  const tiles = [
    { label: 'Total fee', value: summary.total_assigned, tone: 'default' },
    { label: 'Paid', value: summary.total_paid, tone: 'success' },
    { label: 'Outstanding', value: summary.total_outstanding, tone: 'danger' },
  ]
  const tones = {
    success: 'border-emerald-200 bg-emerald-50/60',
    danger: 'border-red-200 bg-red-50/60',
    default: 'border-slate-200 bg-white',
  }
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className={`rounded-xl border p-4 ${tones[tile.tone] || tones.default}`}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tile.label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{tile.value ?? '0'}</p>
        </div>
      ))}
    </div>
  )
}

function PaymentStatusBadge({ status }) {
  const label = status === 'none' ? 'No fees' : status
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[status] || STATUS_BADGE.none}`}>
      {label}
    </span>
  )
}

export function FeesCollectPage() {
  const schoolScope = useSchoolScopedSelection()
  const listConfig = useMemo(
    () => ({ params: { school: schoolScope.schoolId }, ...schoolScope.listRequestConfig }),
    [schoolScope],
  )

  const [viewMode, setViewMode] = useState('student')
  const [yearId, setYearId] = useState('')
  const [sectionId, setSectionId] = useState('')
  const [collectionType, setCollectionType] = useState('installment')
  const [paymentMode, setPaymentMode] = useState('cash')
  const [paymentRef, setPaymentRef] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [lastReceipt, setLastReceipt] = useState(null)
  const [lastStructureInvoices, setLastStructureInvoices] = useState([])

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
    setLookupKey,
    searchCandidates,
    searching,
    handleSearch,
    selectCandidate,
    clearLookup,
    student,
    studentId,
    studentQuery,
  } = studentLookup

  const paymentRefConfig = useMemo(() => getPaymentReferenceConfig(paymentMode), [paymentMode])

  useEffect(() => {
    setPaymentRef('')
  }, [paymentMode])

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

  const sectionsQuery = useQuery({
    queryKey: ['class-sections-collect', schoolScope.schoolId, yearId],
    queryFn: () =>
      listActiveClassSections({
        schoolId: schoolScope.schoolId,
        academicYearId: yearId,
        pageSize: 500,
      }),
    enabled: Boolean(schoolScope.schoolId && yearId && viewMode === 'class'),
  })

  const sectionOptions = useMemo(
    () =>
      sortClassSections(sectionsQuery.data?.results || []).map((cs) => ({
        label: classSectionLabel(cs),
        value: String(cs.id),
      })),
    [sectionsQuery.data],
  )

  const rosterQuery = useQuery({
    queryKey: ['class-collect-roster', schoolScope.schoolId, yearId, sectionId],
    queryFn: () =>
      feesService.classCollectRoster(
        {
          school: schoolScope.schoolId,
          academic_year: yearId,
          class_section: sectionId,
        },
        listConfig,
      ),
    enabled: Boolean(schoolScope.schoolId && yearId && sectionId && viewMode === 'class'),
  })

  const roster = useMemo(() => unwrap(rosterQuery.data), [rosterQuery.data])

  const profileQuery = useQuery({
    queryKey: ['fee-profile-collect', studentId, yearId],
    queryFn: () =>
      feesService.studentProfile(
        { school: schoolScope.schoolId, student: studentId, academic_year: yearId },
        listConfig,
      ),
    enabled: Boolean(studentId && yearId && schoolScope.schoolId),
  })

  const feeItemsQuery = useQuery({
    queryKey: ['fee-items-collect', studentId, yearId],
    queryFn: () =>
      feesService.studentFeeItems(
        { student: studentId, academic_year: yearId, school: schoolScope.schoolId },
        listConfig,
      ),
    enabled: Boolean(studentId && yearId && schoolScope.schoolId),
  })

  const profile = useMemo(() => unwrap(profileQuery.data), [profileQuery.data])
  const feeItemsData = useMemo(() => unwrap(feeItemsQuery.data), [feeItemsQuery.data])
  const feeItems = feeItemsData?.items || []
  const feeSummary = feeItemsData?.summary
  const structureProgress = feeItemsData?.structure_progress || []
  const savedStructureInvoices = feeItemsData?.structure_invoices || []
  const collectibleItems = useMemo(
    () => feeItems.filter((item) => item.can_collect),
    [feeItems],
  )
  const fullyPaidStructures = useMemo(
    () => structureProgress.filter((row) => row.all_paid),
    [structureProgress],
  )
  const allFeesPaid = feeItems.length > 0 && collectibleItems.length === 0
  const showStructureInvoicePanel = allFeesPaid && fullyPaidStructures.length > 0

  const generateStructureMut = useMutation({
    mutationFn: (payload) => feesService.generateStructureInvoice(payload, listConfig),
    onSuccess: () => {
      toast.success('Structure invoice generated')
      feeItemsQuery.refetch()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const resolveStructureInvoice = (row) => {
    if (row.structure_invoice_id) {
      return {
        id: row.structure_invoice_id,
        invoiceNumber: row.structure_invoice_number,
      }
    }
    const fromSaved = savedStructureInvoices.find((inv) => inv.template_id === row.template_id)
    if (fromSaved) {
      return { id: fromSaved.id, invoiceNumber: fromSaved.invoice_number }
    }
    const fromRecent = lastStructureInvoices.find((inv) => inv.template_id === row.template_id)
    if (fromRecent) {
      return { id: fromRecent.id, invoiceNumber: fromRecent.invoice_number }
    }
    return null
  }

  const handleGenerateStructureInvoice = (row) => {
    if (!studentId || !yearId) {
      toast.error('Student and academic year are required')
      return
    }
    generateStructureMut.mutate({
      student_id: studentId,
      template_id: row.template_id,
      academic_year_id: yearId,
      school_id: schoolScope.schoolId,
    })
  }

  const walletQuery = useQuery({
    queryKey: ['fee-wallet-collect', studentId, schoolScope.schoolId],
    queryFn: () => feesService.wallets({ student: studentId }, listConfig),
    enabled: Boolean(studentId && schoolScope.schoolId),
  })
  const walletBalance = useMemo(() => {
    const { results } = unwrapList(walletQuery.data)
    return results?.[0]?.balance
  }, [walletQuery.data])

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
      is_staff_child: profile?.is_staff_child ?? Boolean(student?.is_staff_child),
      staff_child_status: profile?.staff_child_status || (student?.is_staff_child ? 'Yes' : 'No'),
      staff_name: profile?.staff_name || student?.staff_name || '',
      staff_employee_id: profile?.staff_employee_id || student?.staff_employee_id || '',
    }
  }, [student, profile])

  const collectibleKey = useMemo(
    () => collectibleItems.map((i) => i.assignment_id).join('|'),
    [collectibleItems],
  )

  useEffect(() => {
    setSelectedIds(new Set())
    setLastReceipt(null)
    setLastStructureInvoices([])
  }, [studentId, yearId])

  useEffect(() => {
    if (collectionType === 'full' && collectibleItems.length) {
      setSelectedIds(new Set(collectibleItems.map((i) => i.assignment_id)))
    }
  }, [collectionType, studentId, collectibleKey, collectibleItems])

  const toggleItem = (assignmentId, canCollect) => {
    if (!canCollect || collectionType === 'full') return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(assignmentId)) next.delete(assignmentId)
      else next.add(assignmentId)
      return next
    })
  }

  const selectedTotal = useMemo(
    () =>
      feeItems
        .filter((item) => selectedIds.has(item.assignment_id))
        .reduce((sum, item) => sum + Number(item.collect_amount ?? item.balance_due ?? 0), 0),
    [feeItems, selectedIds],
  )

  const handleFindStudent = async () => {
    setSelectedIds(new Set())
    setLastReceipt(null)
    setLastStructureInvoices([])
    await handleSearch()
  }

  const openStudentCollect = (row) => {
    setAdmissionNo(row.admission_number || '')
    setStudentName(row.full_name || '')
    setLookupKey(buildStudentLookupKey(row.student_id, yearId))
    setSelectedIds(new Set())
    setLastReceipt(null)
    setLastStructureInvoices([])
  }

  const collectMut = useMutation({
    mutationFn: () =>
      feesService.collectItems(
        {
          student_id: studentId,
          assignment_ids: Array.from(selectedIds),
          payment_mode: paymentMode,
          transaction_ref: paymentRef.trim() || undefined,
          school_id: schoolScope.schoolId,
        },
        listConfig,
      ),
    onSuccess: (res) => {
      const data = unwrap(res)
      setLastReceipt(data.receipt)
      setLastStructureInvoices(data.structure_invoices || [])
      toast.success(
        data.structure_invoices?.length
          ? `Receipt ${data.receipt?.receipt_number || 'issued'}. Structure invoice ${data.structure_invoices[0].invoice_number} generated.`
          : `Receipt ${data.receipt?.receipt_number || 'issued'}`,
      )
      setSelectedIds(new Set())
      setPaymentRef('')
      profileQuery.refetch()
      feeItemsQuery.refetch()
      if (sectionId) rosterQuery.refetch()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleCollect = () => {
    if (!selectedIds.size) {
      toast.error('Select at least one fee item to collect')
      return
    }
    if (paymentRefConfig?.required && !paymentRef.trim()) {
      toast.error(`Enter ${paymentRefConfig.label.toLowerCase()}`)
      return
    }
    collectMut.mutate()
  }

  const renderStudentCollectPanel = () => (
    <>
      {studentDisplay ? (
        <>
          <FeeStudentSummaryCard
            student={studentDisplay}
            outstanding={feeSummary?.total_outstanding ?? profile.outstanding}
            className="mt-4"
          />
          {walletBalance != null ? (
            <p className="mt-2 text-sm text-muted">
              Wallet / advance balance: <strong className="text-foreground">{walletBalance}</strong>
            </p>
          ) : null}
        </>
      ) : null}

      {studentId ? (
        <div className="mt-6 space-y-4">
          <FeeSummaryTiles summary={feeSummary} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SelectField
              label="Collection type"
              value={collectionType}
              onChange={(e) => setCollectionType(e.target.value)}
              options={[
                { label: 'Installment — select fee codes', value: 'installment' },
                { label: 'Full outstanding — pay all due', value: 'full' },
              ]}
            />
            {collectionType === 'installment' && collectibleItems.length ? (
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === collectibleItems.length && collectibleItems.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(collectibleItems.map((i) => i.assignment_id)))
                      } else {
                        setSelectedIds(new Set())
                      }
                    }}
                  />
                  Select all pending
                </label>
              </div>
            ) : null}
          </div>

          {feeItemsQuery.isLoading ? (
            <p className="text-sm text-muted">Loading fee items…</p>
          ) : feeItems.length === 0 ? (
            <p className="text-sm text-amber-700">
              No fees assigned for this student. Generate fees from{' '}
              <Link to="/fees/generate" className="font-medium text-primary underline">
                Generate Fees
              </Link>
              .
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 w-12">Pay</th>
                    <th className="px-4 py-3">Fee code</th>
                    <th className="px-4 py-3">Structure</th>
                    <th className="px-4 py-3">Gross</th>
                    <th className="px-4 py-3">Concession</th>
                    <th className="px-4 py-3">Net</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Due</th>
                    <th className="px-4 py-3">Late fee</th>
                    <th className="px-4 py-3">Collect</th>
                    <th className="px-4 py-3">Due / End</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {feeItems.map((item) => (
                    <tr
                      key={item.assignment_id}
                      className={`border-t border-border ${item.is_paid ? 'bg-emerald-50/30' : item.is_overdue ? 'bg-red-50/40' : ''}`}
                    >
                      <td className="px-4 py-3">
                        {item.can_collect ? (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.assignment_id)}
                            disabled={collectionType === 'full'}
                            onChange={() => toggleItem(item.assignment_id, item.can_collect)}
                          />
                        ) : (
                          <span className="text-xs text-emerald-700">✓</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{item.fee_head_name}</span>
                        <span className="ml-1 text-muted">({item.fee_head_code})</span>
                      </td>
                      <td className="px-4 py-3 text-muted">{item.structure_name || '—'}</td>
                      <td className="px-4 py-3">{item.gross_amount}</td>
                      <td className="px-4 py-3 text-blue-700">
                        {Number(item.concession_amount) > 0
                          ? item.concession_amount
                          : Number(item.pending_concession_amount) > 0
                            ? `${item.pending_concession_amount} (pending)`
                            : '—'}
                      </td>
                      <td className="px-4 py-3">{item.net_amount}</td>
                      <td className="px-4 py-3 text-emerald-700">{item.paid_amount}</td>
                      <td className="px-4 py-3">{item.balance_due}</td>
                      <td className="px-4 py-3 text-red-700">{Number(item.late_fee) > 0 ? item.late_fee : '—'}</td>
                      <td className="px-4 py-3 font-semibold">{item.can_collect ? item.collect_amount : '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {item.due_date || '—'}
                        {item.end_date ? ` → ${item.end_date}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={item.is_paid ? 'paid' : item.is_overdue ? 'overdue' : item.status === 'partial' ? 'partial' : 'unpaid'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-border bg-slate-50/80">
                  <tr>
                    <td colSpan={9} className="px-4 py-3 text-right font-medium">
                      Selected to collect
                    </td>
                    <td colSpan={3} className="px-4 py-3 font-semibold">
                      {selectedTotal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {collectibleItems.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Payment mode"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
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
                  disabled={!selectedIds.size || collectMut.isPending}
                  onClick={handleCollect}
                >
                  Collect {collectionType === 'full' ? 'full outstanding' : `selected (${selectedIds.size})`} — {selectedTotal.toLocaleString()}
                </Button>
              </div>
            </div>
          ) : feeItems.length > 0 ? (
            <p className="text-sm text-emerald-700">All fees are fully paid for this student.</p>
          ) : null}

          {showStructureInvoicePanel ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-3">
              <p className="text-sm font-medium text-blue-900">
                Consolidated structure invoice{fullyPaidStructures.length > 1 ? 's' : ''} — view or download PDF
              </p>
              <FeeStructureCompletionPanel
                structures={fullyPaidStructures.map((row) => ({
                  ...row,
                  structure_invoice_id: resolveStructureInvoice(row)?.id || row.structure_invoice_id,
                  structure_invoice_number: resolveStructureInvoice(row)?.invoiceNumber || row.structure_invoice_number,
                }))}
                onGenerate={handleGenerateStructureInvoice}
                generating={generateStructureMut.isPending}
                schoolId={schoolScope.schoolId}
                listConfig={listConfig}
              />
            </div>
          ) : null}

          {lastReceipt ? (
            <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
              <p className="text-sm font-medium text-green-900">
                Receipt {lastReceipt.receipt_number} issued
              </p>
              <FeeReceiptActions
                receiptId={lastReceipt.id}
                receiptNumber={lastReceipt.receipt_number}
                schoolId={schoolScope.schoolId}
                listConfig={listConfig}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collect Payment"
        description="Search student or browse class-wise — view paid & outstanding, collect installment or full due"
        actions={<Link to="/fees"><Button variant="secondary">Back</Button></Link>}
      />

      <Card className="p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setViewMode('student')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === 'student'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Student wise
          </button>
          <button
            type="button"
            onClick={() => setViewMode('class')}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              viewMode === 'class'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Class wise
          </button>
        </div>

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
                setSectionId('')
                setSelectedIds(new Set())
              }}
              options={[{ label: 'Select…', value: '' }, ...yearOptions]}
              required
            />
          </div>

          {viewMode === 'student' ? (
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

        {viewMode === 'student' ? (
          <>
            <StudentSearchCandidates candidates={searchCandidates} onSelect={selectCandidate} />
            {studentQuery.isError && lookupKey ? (
              <p className="mt-3 text-sm text-red-600">{getErrorMessage(studentQuery.error)}</p>
            ) : null}
            {renderStudentCollectPanel()}
          </>
        ) : (
          <div className="mt-6 space-y-4">
            {!sectionId ? (
              <p className="text-sm text-muted">Select a class to view students and collect fees.</p>
            ) : rosterQuery.isLoading ? (
              <p className="text-sm text-muted">Loading class students…</p>
            ) : (
              <>
                {roster?.summary ? (
                  <FeeSummaryTiles
                    summary={{
                      total_assigned: roster.summary.total_assigned,
                      total_paid: roster.summary.total_paid,
                      total_outstanding: roster.summary.total_outstanding,
                    }}
                  />
                ) : null}

                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-3">Roll</th>
                        <th className="px-4 py-3">Admission</th>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Total fee</th>
                        <th className="px-4 py-3">Paid</th>
                        <th className="px-4 py-3">Outstanding</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 w-16 text-center">Collect</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(roster?.students || []).map((row) => (
                        <tr key={row.student_id} className="border-t border-border">
                          <td className="px-4 py-3">{row.roll_number || '—'}</td>
                          <td className="px-4 py-3">{row.admission_number || '—'}</td>
                          <td className="px-4 py-3 font-medium">{row.full_name}</td>
                          <td className="px-4 py-3">{row.total_assigned}</td>
                          <td className="px-4 py-3 text-emerald-700">{row.total_paid}</td>
                          <td className="px-4 py-3 font-medium text-red-700">{row.outstanding}</td>
                          <td className="px-4 py-3">
                            <PaymentStatusBadge status={row.payment_status} />
                          </td>
                          <td className="px-4 py-3 text-center">
                            {row.has_due ? (
                              <button
                                type="button"
                                title="Collect fee"
                                onClick={() => openStudentCollect(row)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition hover:bg-primary/90"
                              >
                                <FiCreditCard className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!roster?.students?.length ? (
                    <p className="p-4 text-sm text-muted">No active students in this class.</p>
                  ) : null}
                </div>

                {studentId ? (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="mb-3 text-sm font-semibold text-primary">
                      Collecting for {studentDisplay?.full_name || studentName}
                    </p>
                    {renderStudentCollectPanel()}
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}
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
  const [templateId, setTemplateId] = useState('')

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

  const templatesQuery = useQuery({
    queryKey: ['fee-templates-generate', schoolScope.schoolId, yearId],
    queryFn: () =>
      feesService.templates({ academic_year: yearId, page_size: 100, is_active: true }, listConfig),
    enabled: Boolean(schoolScope.schoolId && yearId),
  })

  const templates = useMemo(() => {
    const { results } = unwrapList(templatesQuery.data)
    return results || []
  }, [templatesQuery.data])

  const selectedTemplate = useMemo(
    () => templates.find((t) => String(t.id) === templateId),
    [templates, templateId],
  )

  const structureTotal = useMemo(
    () =>
      (selectedTemplate?.lines || []).reduce((sum, line) => sum + Number(line.amount || 0), 0),
    [selectedTemplate],
  )

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

  const templateOptions = useMemo(
    () => [
      { label: 'Select fee structure…', value: '' },
      ...templates.map((t) => ({
        label: `${t.name} (${t.lines?.length || 0} items)`,
        value: String(t.id),
      })),
    ],
    [templates],
  )

  const handleFindStudent = async () => {
    await handleSearch()
  }

  const generateMut = useMutation({
    mutationFn: () => {
      const payload = {
        academic_year_id: yearId,
        template_id: templateId,
        school_id: schoolScope.schoolId,
      }
      if (mode === 'class') {
        return feesService.assign({ ...payload, class_section_id: sectionId }, listConfig)
      }
      return feesService.assign({ ...payload, student_id: studentId }, listConfig)
    },
    onSuccess: (res) => {
      const data = unwrap(res)
      const count = data?.results?.length ?? (mode === 'student' ? 0 : 0)
      if (mode === 'class') {
        const students = selectedSection?.enrolled_count ?? selectedSection?.strength
        toast.success(
          count
            ? `Generated ${count} fee item(s) for class (${students ?? 'all'} students × ${selectedTemplate?.lines?.length || 0} codes)`
            : 'No active students found in this class for the selected year',
        )
      } else {
        toast.success(
          `Generated ${count} fee item(s) for student from "${selectedTemplate?.name || 'structure'}"`,
        )
      }
      setTemplateId('')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const canGenerateStudent = mode === 'student' && studentId && templateId && selectedTemplate?.lines?.length
  const canGenerateClass = mode === 'class' && sectionId && templateId && yearId && selectedTemplate?.lines?.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Generate Fees"
        description="Step 3 — Select a fee structure, preview all fee codes, then generate class-wise or student-wise"
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
                setTemplateId('')
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
          <div className="mt-4 space-y-4">
            <SelectField
              label="Fee structure"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              options={templateOptions}
              disabled={!yearId || templatesQuery.isLoading}
            />

            {selectedTemplate?.lines?.length ? (
              <div className="rounded-xl border border-border bg-slate-50/80 p-4">
                <p className="mb-2 text-sm font-semibold">
                  {selectedTemplate.name} — {selectedTemplate.lines.length} fee code(s) · Total {structureTotal.toLocaleString()}
                </p>
                {(selectedTemplate.effective_from || selectedTemplate.effective_to) ? (
                  <p className="mb-2 text-xs text-muted">
                    Due: {selectedTemplate.effective_from || '—'} · End: {selectedTemplate.effective_to || '—'}
                    {selectedTemplate.effective_to ? ' (late fee applies after end date)' : ''}
                  </p>
                ) : null}
                <ul className="space-y-1 text-sm">
                  {selectedTemplate.lines.map((line) => (
                    <li key={line.id} className="flex justify-between gap-4">
                      <span>{line.fee_head_name || line.description || line.fee_head}</span>
                      <span className="font-medium">{line.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex items-end">
              <Button
                variant="primary"
                disabled={!(canGenerateStudent || canGenerateClass) || generateMut.isPending}
                onClick={() => generateMut.mutate()}
              >
                {mode === 'class' ? 'Generate for class' : 'Generate for student'}
              </Button>
            </div>
          </div>
        ) : null}

        {!templates.length && schoolScope.schoolId && yearId && !templatesQuery.isLoading ? (
          <p className="mt-4 text-sm text-amber-700">
            No fee structures for this year.{' '}
            <Link to="/fees/structure" className="font-medium text-primary underline">
              Create a fee structure first
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

function feeCodesLabel(row) {
  if (row?.fee_codes_label) return row.fee_codes_label
  if (Array.isArray(row?.fee_codes) && row.fee_codes.length) {
    return row.fee_codes
      .map((c) => {
        const name = c.fee_head_name || c.fee_head_code || ''
        const code = c.fee_head_code || ''
        return code && name ? `${name} (${code})` : name || code
      })
      .filter(Boolean)
      .join(', ')
  }
  if (row?.fee_head_name) {
    return row.fee_head_code ? `${row.fee_head_name} (${row.fee_head_code})` : row.fee_head_name
  }
  return '—'
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

  const generateStructureMut = useMutation({
    mutationFn: (payload) => feesService.generateStructureInvoice(payload, listConfig),
    onSuccess: () => {
      toast.success('Structure invoice generated')
      ledgerQuery.refetch()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleFindStudent = async () => {
    setActiveTab('outstanding')
    await handleSearch()
  }

  const ledger = ledgerQuery.data
  const summary = ledger?.summary || {}
  const tabs = [
    { key: 'outstanding', label: 'Outstanding' },
    { key: 'structure_invoices', label: 'Structure Invoices' },
    { key: 'transactions', label: 'All Transactions' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'payments', label: 'Payments' },
    { key: 'receipts', label: 'Receipts' },
    { key: 'refunds', label: 'Refunds' },
  ]

  const structureProgress = ledger?.structure_progress || []
  const structureInvoices = ledger?.structure_invoices || []
  const parsedLookup = lookupKey ? parseStudentLookupKey(lookupKey) : null

  const handleGenerateStructureInvoice = (row) => {
    if (!parsedLookup?.studentId || !ledger?.academic_year?.id) {
      toast.error('Student and academic year are required')
      return
    }
    generateStructureMut.mutate({
      student_id: parsedLookup.studentId,
      template_id: row.template_id,
      academic_year_id: ledger.academic_year.id,
      school_id: schoolScope.schoolId,
    })
  }

  const renderStructureInvoiceActions = (row) => (
    <FeeStructureInvoiceActions
      invoiceId={row.id || row.structure_invoice_id}
      invoiceNumber={row.invoice_number || row.structure_invoice_number}
      schoolId={schoolScope.schoolId}
      listConfig={listConfig}
      compact
    />
  )

  const outstandingRows = ledger?.outstanding_breakdown || []
  const outstandingTotal = useMemo(
    () => outstandingRows.reduce((sum, row) => sum + Number(row.balance_due || 0), 0),
    [outstandingRows],
  )

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
              <SummaryTile label="Total paid" value={summary.total_paid} tone="success" />
              <SummaryTile label="Outstanding" value={summary.outstanding} tone="danger" />
              <SummaryTile label="Pending fee codes" value={summary.pending_fee_count ?? outstandingRows.length} />
            </div>
            {(summary.total_concession !== '0.00' || summary.total_scholarship !== '0.00' || summary.total_refunded !== '0.00' || summary.total_invoiced) ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryTile label="Total invoiced" value={summary.total_invoiced} />
                {summary.invoice_outstanding != null ? (
                  <SummaryTile label="Invoice outstanding" value={summary.invoice_outstanding} />
                ) : null}
                <SummaryTile label="Concessions" value={summary.total_concession} />
                <SummaryTile label="Scholarships" value={summary.total_scholarship} />
                <SummaryTile label="Refunded" value={summary.total_refunded} />
              </div>
            ) : null}

            {outstandingRows.length > 0 ? (
              <div className="mt-5">
                <h3 className="mb-3 text-sm font-semibold text-red-800">
                  Outstanding by fee code
                </h3>
                <div className="overflow-x-auto rounded-lg border border-red-200">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-red-50 text-slate-700">
                      <tr>
                        <th className="px-4 py-3">Fee code</th>
                        <th className="px-4 py-3">Fee head</th>
                        <th className="px-4 py-3">Structure</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Paid</th>
                        <th className="px-4 py-3">Outstanding</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Due date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {outstandingRows.map((row) => (
                        <tr key={row.assignment_id} className="border-t border-red-100">
                          <td className="px-4 py-3 font-medium">{row.fee_head_code || '—'}</td>
                          <td className="px-4 py-3">{row.fee_head_name}</td>
                          <td className="px-4 py-3 text-muted">{row.structure_name || '—'}</td>
                          <td className="px-4 py-3">{row.net_amount}</td>
                          <td className="px-4 py-3 text-emerald-700">{row.paid_amount}</td>
                          <td className="px-4 py-3 font-semibold text-red-700">{row.balance_due}</td>
                          <td className="px-4 py-3 capitalize">{row.status}</td>
                          <td className="px-4 py-3">{row.due_date || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t border-red-200 bg-red-50/80">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right font-medium">
                          Total outstanding
                        </td>
                        <td colSpan={3} className="px-4 py-3 font-semibold text-red-800">
                          {Number(summary.outstanding ?? outstandingTotal).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-emerald-700">No pending outstanding fees for this student.</p>
            )}

            {structureProgress.length > 0 ? (
              <div className="mt-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Fee structure completion
                </h3>
                <FeeStructureCompletionPanel
                  structures={structureProgress}
                  onGenerate={handleGenerateStructureInvoice}
                  generating={generateStructureMut.isPending}
                  schoolId={schoolScope.schoolId}
                  listConfig={listConfig}
                />
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
              {activeTab === 'outstanding' ? (
                <LedgerTable
                  emptyMessage="No pending outstanding fees for this student."
                  columns={[
                    { key: 'fee_head_code', label: 'Fee code' },
                    { key: 'fee_head_name', label: 'Fee head' },
                    { key: 'structure_name', label: 'Structure', render: (r) => r.structure_name || '—' },
                    { key: 'net_amount', label: 'Amount' },
                    { key: 'paid_amount', label: 'Paid' },
                    { key: 'balance_due', label: 'Outstanding' },
                    { key: 'status', label: 'Status' },
                    { key: 'due_date', label: 'Due date', render: (r) => r.due_date || '—' },
                  ]}
                  rows={outstandingRows}
                />
              ) : null}

              {activeTab === 'structure_invoices' ? (
                <>
                  <LedgerTable
                    emptyMessage="No consolidated structure invoices yet. When all fee codes in a structure are paid, an invoice is generated automatically."
                    columns={[
                      { key: 'invoice_number', label: 'Invoice #' },
                      { key: 'structure_name', label: 'Structure' },
                      { key: 'fee_codes_label', label: 'Fee codes' },
                      { key: 'item_count', label: 'Items' },
                      { key: 'total_amount', label: 'Total' },
                      {
                        key: 'issued_at',
                        label: 'Issued at',
                        render: (r) => (r.issued_at ? String(r.issued_at).slice(0, 16).replace('T', ' ') : '—'),
                      },
                    ]}
                    rows={structureInvoices}
                    rowActions={renderStructureInvoiceActions}
                  />
                  {structureProgress.some((row) => row.all_paid && !row.structure_invoice_id) ? (
                    <div className="border-t border-slate-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-900">
                      Some structures are fully paid but do not have a consolidated invoice yet. Use{' '}
                      <strong>Generate invoice</strong> in the summary above.
                    </div>
                  ) : null}
                </>
              ) : null}

              {activeTab === 'transactions' ? (
                <LedgerTable
                  emptyMessage="No transactions for this student and academic year."
                  columns={[
                    { key: 'date', label: 'Date' },
                    { key: 'type', label: 'Type', render: (r) => r.type?.replace('_', ' ') },
                    { key: 'reference', label: 'Reference' },
                    { key: 'fee_codes_label', label: 'Fee codes', render: feeCodesLabel },
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
                    { key: 'fee_head_code', label: 'Fee code' },
                    { key: 'fee_head_name', label: 'Fee head' },
                    { key: 'label', label: 'Label' },
                    { key: 'net_amount', label: 'Net amount' },
                    { key: 'paid_amount', label: 'Paid' },
                    { key: 'balance_due', label: 'Outstanding' },
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
                    { key: 'fee_codes_label', label: 'Fee codes', render: feeCodesLabel },
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
                    { key: 'fee_codes_label', label: 'Fee codes', render: feeCodesLabel },
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
                    { key: 'fee_codes_label', label: 'Fee codes', render: feeCodesLabel },
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
