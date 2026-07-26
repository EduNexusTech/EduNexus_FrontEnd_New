import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiCheck, FiFileText, FiUserCheck } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { admissionService } from '@/api/services'
import { listActiveClassSections } from '@/api/activeClassSections'
import { getErrorMessage, unwrapData, unwrapList } from '@/api/client'
import {
  ADMISSION_LADDER,
  resolveApplicationLadderStep,
  isLadderStepDone,
} from '@/features/admissions/types/workflow'
import { ApplicationFormReadonly } from '@/features/admissions/components/ApplicationFormReadonly'
import { cn } from '@/lib/utils'

function LadderStep({ step, done, active }) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2 text-xs',
        done && 'border-emerald-200 bg-emerald-50 text-emerald-800',
        active && !done && 'border-brand-300 bg-brand-50 font-medium text-brand-800',
        !done && !active && 'border-border font-normal text-muted-foreground',
      )}
    >
      <p>{step.label}</p>
      {active ? <p className="mt-0.5 font-normal opacity-80">{step.description}</p> : null}
    </div>
  )
}

export default function AdmissionApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('form') // form | workflow
  const [docType, setDocType] = useState('birth_certificate')
  const [docFile, setDocFile] = useState(null)
  const [feeAmount, setFeeAmount] = useState('')
  const [testScore, setTestScore] = useState('')
  const [interviewScore, setInterviewScore] = useState('')
  const [classSectionId, setClassSectionId] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admission-applications', id],
    queryFn: () => admissionService.applications.get(id),
  })

  const appPreview = unwrapData(data)
  const schoolId = appPreview?.school_id || appPreview?.school || null
  const academicYearId = appPreview?.academic_year_id || appPreview?.academic_year || null

  const classSectionsQuery = useQuery({
    queryKey: ['class-sections', String(schoolId || ''), String(academicYearId || '')],
    queryFn: async () => {
      // Prefer school + academic year; if empty, fall back to school-only so options still appear.
      // Only year-activated class sections appear in academic workflows
      const primary = await listActiveClassSections({ schoolId, academicYearId })
      if ((primary.results || []).length > 0 || !schoolId || !academicYearId) {
        return primary
      }
      return listActiveClassSections({ schoolId })
    },
    enabled: Boolean(id && schoolId),
  })

  const classSections = useMemo(() => {
    const list = unwrapList(classSectionsQuery.data)
    const rows = list.results || []
    return [...rows].sort((a, b) => {
      const la = `${a.class_name || ''} ${a.section_name || ''}`
      const lb = `${b.class_name || ''} ${b.section_name || ''}`
      return la.localeCompare(lb)
    })
  }, [classSectionsQuery.data])

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admission-applications', id] })
    queryClient.invalidateQueries({ queryKey: ['admission-applications'] })
    refetch()
  }

  const actionMutation = useMutation({
    mutationFn: ({ fn, payload }) => fn(id, payload),
    onSuccess: (res, variables) => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['students'] })
      const isConfirm = variables?.fn === admissionService.applications.confirm
      const isEnroll = variables?.fn === admissionService.applications.enroll
      if (isConfirm) {
        toast.success('Admission confirmed — next: select class & activate student')
        setTab('workflow')
        return
      }
      if (isEnroll) {
        const payload = unwrapData(res)
        const enrollment = payload?.enrollment || {}
        toast.success(
          enrollment.message ||
            'Student activated — now visible in Students list',
        )
        navigate('/students')
        return
      }
      toast.success('Step completed')
      const receipt = unwrapData(res)?.receipt
      if (receipt) toast.success(`Receipt: ${receipt.receipt_number}`)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const uploadMutation = useMutation({
    mutationFn: (formData) => admissionService.applications.uploadDocument(id, formData),
    onSuccess: () => {
      invalidate()
      setDocFile(null)
      toast.success('Document uploaded')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />

  const app = unwrapData(data)
  const currentStep = resolveApplicationLadderStep(app)
  const enrollment = app.enrollment || {}
  const docs = app.documents || []
  const run = (fn, payload) => actionMutation.mutate({ fn, payload })

  const sectionLabel = (row) =>
    row.name ||
    row.display_name ||
    [row.class_name || row.school_class_name, row.section_name || row.section]
      .filter(Boolean)
      .join(' — ') ||
    String(row.id || row.class_section_id)

  return (
    <div className="w-full space-y-6">
      <Breadcrumb
        items={[
          { label: 'Admissions', href: '/admissions' },
          { label: 'Applications', href: '/admissions/applications/internal' },
          { label: app.full_name || 'Detail' },
        ]}
      />
      <PageHeader
        title={app.full_name || 'Application'}
        description={
          app.admission_number
            ? `Admission #${app.admission_number}`
            : `${app.status_display || 'Application'} · ${app.is_draft ? 'Draft' : 'Submitted'}`
        }
        actions={
          <>
            <Link to="/admissions/confirmed">
              <Button variant="outline">Confirmed list</Button>
            </Link>
            <Link to="/admissions/applications/internal">
              <Button variant="outline">Back to list</Button>
            </Link>
            <Link to={`/admissions/applications/${id}/edit`}>
              <Button variant="edit">Edit Form</Button>
            </Link>
            <Button variant="refresh" onClick={() => refetch()}>
              Refresh
            </Button>
          </>
        }
      />

      <div className="flex gap-1 rounded-xl border border-border bg-card p-1">
        <button
          type="button"
          className={cn(
            'rounded-lg px-4 py-2 text-sm transition',
            tab === 'form' ? 'bg-brand-600 font-medium text-white' : 'font-normal text-muted-foreground hover:bg-muted',
          )}
          onClick={() => setTab('form')}
        >
          Full Application
        </button>
        <button
          type="button"
          className={cn(
            'rounded-lg px-4 py-2 text-sm transition',
            tab === 'workflow' ? 'bg-brand-600 font-medium text-white' : 'font-normal text-muted-foreground hover:bg-muted',
          )}
          onClick={() => setTab('workflow')}
        >
          Admission Workflow
        </button>
      </div>

      {tab === 'form' ? (
        <Card>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-black">Full Application Form</h2>
              <p className="mt-1 text-sm font-normal text-muted-foreground">
                Complete details submitted for this applicant. Use Edit Form to make changes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-normal text-muted-foreground">
              {app.application_number ? (
                <span>
                  App No:{' '}
                  <span className="text-black" style={{ fontWeight: 500 }}>
                    {app.application_number}
                  </span>
                </span>
              ) : null}
              {app.academic_year_name ? (
                <span>
                  Year:{' '}
                  <span className="text-black" style={{ fontWeight: 500 }}>
                    {app.academic_year_name}
                  </span>
                </span>
              ) : null}
              <span>
                Status:{' '}
                <span className="text-black" style={{ fontWeight: 500 }}>
                  {app.status_display || app.status}
                </span>
              </span>
            </div>
          </div>
          <ApplicationFormReadonly application={app} />
        </Card>
      ) : (
        <>
      <Card>
        <h3 className="mb-1 text-sm font-semibold text-foreground">Full admission ladder</h3>
        <p className="mb-4 text-xs font-normal text-muted-foreground">
          Enquiry → Counselling → Campus Visit happen on the lead. This page continues from
          Application Form through Student Activated.
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ADMISSION_LADDER.map((step) => (
            <LadderStep
              key={step.id}
              step={step}
              done={isLadderStepDone(step.id, currentStep, app)}
              active={currentStep === step.id}
            />
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold text-foreground">Applicant Summary</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Mobile</dt>
              <dd className="text-sm font-medium">{app.mobile_number}</dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Email</dt>
              <dd className="text-sm font-medium">{app.email || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Parent</dt>
              <dd className="text-sm font-medium">{app.parent_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Applied Class</dt>
              <dd className="text-sm font-medium">{app.applied_class_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Status</dt>
              <dd className="text-sm font-medium">{app.status_display}</dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Fee</dt>
              <dd className="text-sm font-medium">
                {app.fee_paid} / {app.fee_amount}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Admission Number</dt>
              <dd className="font-mono text-sm font-medium">{app.admission_number || 'Not generated yet'}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => setTab('form')}>
              <FiFileText className="h-4 w-4" />
              Open full application form
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-2 font-semibold text-foreground">Current step actions</h3>
          <p className="mb-4 text-xs font-normal text-muted-foreground">
            {ADMISSION_LADDER.find((s) => s.id === currentStep)?.description ||
              'Complete the highlighted step on the ladder.'}
          </p>
          <div className="flex flex-col gap-2">
            {['application_form', 'document_upload'].includes(currentStep) ||
            app.status === 'lead' ||
            app.status === 'enquiry' ? (
              <Button
                size="sm"
                onClick={() => run(admissionService.applications.submitApplication)}
                loading={actionMutation.isPending}
              >
                Submit Application Form
              </Button>
            ) : null}

            {currentStep === 'document_verification' || docs.length > 0 ? (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => run(admissionService.applications.verifyDocuments)}
              >
                <FiCheck className="h-4 w-4" /> Verify All Documents
              </Button>
            ) : null}

            {['entrance_test_interview', 'document_upload', 'document_verification'].includes(
              currentStep,
            ) || ['application', 'documents', 'entrance_test'].includes(app.status) ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    run(admissionService.applications.entranceTest, {
                      score: testScore,
                      result: 'passed',
                    })
                  }
                >
                  Save Entrance Test
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    run(admissionService.applications.interview, {
                      score: interviewScore,
                      result: 'recommended',
                    })
                  }
                >
                  Save Interview
                </Button>
              </>
            ) : null}

            {currentStep === 'application_approval' ||
            ['documents', 'entrance_test', 'interview', 'approval'].includes(app.status) ? (
              <>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => run(admissionService.applications.submitApproval)}
                >
                  Submit for Approval
                </Button>
                <Button
                  size="sm"
                  variant="success"
                  onClick={() =>
                    run(admissionService.applications.approve, {
                      fee_amount: feeAmount || app.fee_amount,
                    })
                  }
                >
                  Approve Application
                </Button>
              </>
            ) : null}

            {currentStep === 'fee_payment' || app.status === 'fee' ? (
              <Button
                size="sm"
                onClick={() =>
                  run(admissionService.applications.collectFee, {
                    amount: feeAmount || app.fee_amount,
                    payment_mode: 'cash',
                  })
                }
              >
                Collect Fee & Generate Receipt
              </Button>
            ) : null}

            {currentStep === 'admission_confirmation' ||
            app.status === 'fee' ||
            app.status === 'confirmed' ? (
              <Button
                size="sm"
                variant="success"
                onClick={() => run(admissionService.applications.confirm)}
              >
                Confirm Admission
              </Button>
            ) : null}

            {(currentStep === 'class_section_allocation' ||
              currentStep === 'student_activated' ||
              ['confirmed', 'ready_for_sis'].includes(app.status)) && (
              <Button
                size="sm"
                onClick={() => {
                  const selected =
                    classSectionId || app.class_section_id || app.class_section || ''
                  if (!selected) {
                    toast.error('Select a class & section before activating the student')
                    return
                  }
                  run(admissionService.applications.enroll, {
                    class_section_id: selected,
                    send_credentials: true,
                  })
                }}
                loading={actionMutation.isPending}
                disabled={
                  actionMutation.isPending ||
                  !(classSectionId || app.class_section_id || app.class_section)
                }
              >
                <FiUserCheck className="h-4 w-4" /> Activate Student
              </Button>
            )}

            <Button
              size="sm"
              variant="danger"
              onClick={() =>
                run(admissionService.applications.reject, { reason: 'Not selected' })
              }
            >
              Reject
            </Button>
          </div>
          <Input
            label="Fee amount"
            type="number"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            className="mt-4"
          />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-foreground">Entrance Test / Interview</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Test score"
              value={testScore}
              onChange={(e) => setTestScore(e.target.value)}
            />
            <Input
              label="Interview score"
              value={interviewScore}
              onChange={(e) => setInterviewScore(e.target.value)}
            />
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-foreground">Class & Section Allocation</h3>
          <p className="mb-3 text-xs font-normal text-muted-foreground">
            Required before student activation. Select the class-section to enroll into.
          </p>
          {classSectionsQuery.isLoading ? (
            <p className="text-sm font-normal text-muted-foreground">Loading class & section options…</p>
          ) : classSectionsQuery.isError ? (
            <div className="space-y-2">
              <p className="text-sm font-normal text-danger">
                Could not load class sections. {getErrorMessage(classSectionsQuery.error)}
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => classSectionsQuery.refetch()}>
                Retry
              </Button>
            </div>
          ) : classSections.length === 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm font-normal text-amber-950">
              <p>
                No active class–section options for this school / academic year.
                Create STD → Section → Map under Masters, then activate them under Academics → Active Classes.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/masters/setup/map">
                  <Button type="button" variant="outline" size="sm">
                    Masters Map
                  </Button>
                </Link>
                <Link to="/academics/class-sections">
                  <Button type="button" variant="outline" size="sm">
                    Activate Classes
                  </Button>
                </Link>
                <Button type="button" variant="outline" size="sm" onClick={() => classSectionsQuery.refetch()}>
                  Refresh options
                </Button>
              </div>
            </div>
          ) : (
            <select
              className="lms-select w-full"
              value={classSectionId || app.class_section_id || app.class_section || ''}
              onChange={(e) => setClassSectionId(e.target.value)}
            >
              <option value="">Select class & section</option>
              {classSections.map((row) => (
                <option key={row.id || row.class_section_id} value={row.id || row.class_section_id}>
                  {sectionLabel(row)}
                </option>
              ))}
            </select>
          )}
          {classSections.length > 0 && !(classSectionId || app.class_section_id || app.class_section) ? (
            <p className="mt-2 text-xs font-normal text-amber-800">
              Choose a class & section, then click <strong>Activate Student</strong> to add them to the Students list.
            </p>
          ) : null}
          {app.status === 'enrolled' ? (
            <p className="mt-3 text-sm font-normal text-emerald-800">
              Student activated.{' '}
              <Link to="/students" className="underline">
                Open Students list
              </Link>
            </p>
          ) : null}
          {app.admission_number ? (
            <p className="mt-3 text-sm font-normal text-muted-foreground">
              Admission number: <span className="font-mono font-medium">{app.admission_number}</span>
            </p>
          ) : (
            <p className="mt-3 text-sm font-normal text-muted-foreground">
              Admission number is generated when the application is approved.
            </p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-semibold text-foreground">Document Upload</h3>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <select
            className="rounded-xl border border-border px-3 py-2 text-sm"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            <option value="birth_certificate">Birth Certificate</option>
            <option value="transfer_certificate">Transfer Certificate</option>
            <option value="marksheet">Marksheet</option>
            <option value="photo">Photo</option>
            <option value="aadhar">Aadhar</option>
            <option value="other">Other</option>
          </select>
          <input
            type="file"
            onChange={(e) => setDocFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <Button
            variant="outline"
            loading={uploadMutation.isPending}
            disabled={!docFile}
            onClick={() => {
              const fd = new FormData()
              fd.append('document_type', docType)
              fd.append('file', docFile)
              uploadMutation.mutate(fd)
            }}
          >
            Upload
          </Button>
        </div>
        <ul className="space-y-2">
          {docs.map((doc) => (
            <li
              key={doc.document_id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span>
                {doc.document_type} {doc.verified ? '✓ verified' : '(pending verification)'}
              </span>
              {doc.file_url ? (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  <FiFileText className="inline h-4 w-4" /> View
                </a>
              ) : null}
            </li>
          ))}
          {!docs.length ? (
            <li className="text-sm font-normal text-muted-foreground">No documents uploaded yet.</li>
          ) : null}
        </ul>
      </Card>

      {(app.status === 'enrolled' || enrollment.student_username) && (
        <Card>
          <h3 className="mb-4 font-semibold text-foreground">Student Activated</h3>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Admission No.</dt>
              <dd className="font-mono text-sm">{app.admission_number}</dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Roll No.</dt>
              <dd className="font-mono text-sm">{app.roll_number}</dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Student Username</dt>
              <dd className="font-mono text-sm">{app.student_username || enrollment.student_username}</dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Student Password</dt>
              <dd className="font-mono text-sm">
                {app.student_viewable_password || enrollment.student_password || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Parent Username</dt>
              <dd className="font-mono text-sm">{app.parent_username || enrollment.parent_username || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-normal text-muted-foreground">Parent Password</dt>
              <dd className="font-mono text-sm">
                {app.parent_viewable_password || enrollment.parent_password || '—'}
              </dd>
            </div>
          </dl>
        </Card>
      )}
        </>
      )}
    </div>
  )
}
