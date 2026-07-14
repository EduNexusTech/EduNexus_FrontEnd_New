import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiCheck, FiFileText, FiUserCheck } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { admissionService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { ADMISSION_STATUS_OPTIONS } from '@/config/constants'

function WorkflowStep({ label, done, active }) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-xs ${done ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : active ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border text-muted'}`}>
      {label}
    </div>
  )
}

export default function AdmissionApplicationDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [docType, setDocType] = useState('birth_certificate')
  const [docFile, setDocFile] = useState(null)
  const [feeAmount, setFeeAmount] = useState('')
  const [testScore, setTestScore] = useState('')
  const [interviewScore, setInterviewScore] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admission-applications', id],
    queryFn: () => admissionService.applications.get(id),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admission-applications', id] })
    queryClient.invalidateQueries({ queryKey: ['admission-applications'] })
    refetch()
  }

  const actionMutation = useMutation({
    mutationFn: ({ fn, payload }) => fn(id, payload),
    onSuccess: (res) => {
      invalidate()
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
  const statusIndex = ADMISSION_STATUS_OPTIONS.findIndex((s) => s.value === app.status)
  const enrollment = app.enrollment || {}

  const run = (fn, payload) => actionMutation.mutate({ fn, payload })

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[
        { label: 'Admissions', href: '/admissions' },
        { label: 'Applications', href: '/admissions/applications' },
        { label: app.full_name || 'Detail' },
      ]} />
      <PageHeader
        title={app.full_name || 'Application'}
        subtitle={app.admission_number ? `Admission #${app.admission_number}` : app.status_display}
        actions={
          <>
            <Link to={`/admissions/applications/${id}/edit`}><Button variant="edit">Edit</Button></Link>
            <Button variant="refresh" onClick={() => refetch()}>Refresh</Button>
          </>
        }
      />

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {ADMISSION_STATUS_OPTIONS.filter((s) => !['rejected', 'withdrawn'].includes(s.value)).map((s, idx) => (
          <WorkflowStep key={s.value} label={s.label} done={statusIndex > idx} active={app.status === s.value} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold text-text">Applicant Details</h3>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div><dt className="text-xs text-muted">Mobile</dt><dd className="text-sm font-medium">{app.mobile_number}</dd></div>
            <div><dt className="text-xs text-muted">Email</dt><dd className="text-sm font-medium">{app.email || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Parent</dt><dd className="text-sm font-medium">{app.parent_name || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Class</dt><dd className="text-sm font-medium">{app.applied_class_name || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Status</dt><dd className="text-sm font-medium">{app.status_display}</dd></div>
            <div><dt className="text-xs text-muted">Fee</dt><dd className="text-sm font-medium">{app.fee_paid} / {app.fee_amount}</dd></div>
          </dl>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-text">Workflow Actions</h3>
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={() => run(admissionService.applications.submitApplication)} loading={actionMutation.isPending}>
              Submit Application
            </Button>
            <Button size="sm" variant="success" onClick={() => run(admissionService.applications.submitApproval)}>
              Submit for Approval
            </Button>
            <Button size="sm" variant="success" onClick={() => run(admissionService.applications.approve, { fee_amount: feeAmount || app.fee_amount })}>
              Approve
            </Button>
            <Button size="sm" variant="success" onClick={() => run(admissionService.applications.confirm)}>
              Confirm Admission
            </Button>
            <Button size="sm" onClick={() => run(admissionService.applications.enroll)} loading={actionMutation.isPending}>
              <FiUserCheck className="h-4 w-4" /> Enroll (Create Users)
            </Button>
            <Button size="sm" variant="danger" onClick={() => run(admissionService.applications.reject, { reason: 'Not selected' })}>
              Reject
            </Button>
          </div>
          <Input label="Approve fee amount" type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} className="mt-4" />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 font-semibold text-text">Entrance Test & Interview</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Test score" value={testScore} onChange={(e) => setTestScore(e.target.value)} />
            <Button className="self-end" variant="outline" onClick={() => run(admissionService.applications.entranceTest, { score: testScore, result: 'passed' })}>
              Save Test
            </Button>
            <Input label="Interview score" value={interviewScore} onChange={(e) => setInterviewScore(e.target.value)} />
            <Button className="self-end" variant="outline" onClick={() => run(admissionService.applications.interview, { score: interviewScore, result: 'recommended' })}>
              Save Interview
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 font-semibold text-text">Fee Collection</h3>
          <Input label="Amount" type="number" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)} />
          <Button className="mt-3" onClick={() => run(admissionService.applications.collectFee, { amount: feeAmount || app.fee_amount, payment_mode: 'cash' })}>
            Collect Fee & Generate Receipt
          </Button>
          {app.fee_receipt_number && (
            <p className="mt-2 text-sm text-muted">Receipt: {app.fee_receipt_number}</p>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="mb-4 font-semibold text-text">Documents</h3>
        <div className="mb-4 flex flex-wrap gap-3 items-end">
          <select className="rounded-xl border border-border px-3 py-2 text-sm" value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="birth_certificate">Birth Certificate</option>
            <option value="transfer_certificate">Transfer Certificate</option>
            <option value="marksheet">Marksheet</option>
            <option value="photo">Photo</option>
            <option value="aadhar">Aadhar</option>
            <option value="other">Other</option>
          </select>
          <input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="text-sm" />
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
          <Button variant="secondary" onClick={() => run(admissionService.applications.verifyDocuments)}>
            <FiCheck /> Verify All Documents
          </Button>
        </div>
        <ul className="space-y-2">
          {(app.documents || []).map((doc) => (
            <li key={doc.document_id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span>{doc.document_type} {doc.verified ? '✓' : ''}</span>
              {doc.file_url && (
                <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  <FiFileText className="inline h-4 w-4" /> View
                </a>
              )}
            </li>
          ))}
        </ul>
      </Card>

      {app.status === 'enrolled' && (
        <Card>
          <h3 className="mb-4 font-semibold text-text">Enrollment & Login Credentials</h3>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-xs text-muted">Admission No.</dt><dd className="font-mono text-sm">{app.admission_number}</dd></div>
            <div><dt className="text-xs text-muted">Roll No.</dt><dd className="font-mono text-sm">{app.roll_number}</dd></div>
            <div><dt className="text-xs text-muted">Student Username</dt><dd className="font-mono text-sm">{app.student_username}</dd></div>
            <div><dt className="text-xs text-muted">Student Password</dt><dd className="font-mono text-sm">{app.student_viewable_password || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Parent Username</dt><dd className="font-mono text-sm">{app.parent_username || '—'}</dd></div>
            <div><dt className="text-xs text-muted">Parent Password</dt><dd className="font-mono text-sm">{app.parent_viewable_password || '—'}</dd></div>
          </dl>
        </Card>
      )}
    </div>
  )
}
