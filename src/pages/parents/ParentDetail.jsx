import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState, Avatar } from '@/components/ui/Feedback'
import { parentService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { PARENT_STATUS_OPTIONS } from '@/config/constants'
import { resolveMediaUrl } from '@/utils/format'

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-sm font-medium text-text">{value || '—'}</dd>
    </div>
  )
}

export default function ParentDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [studentId, setStudentId] = useState('')
  const [relation, setRelation] = useState('Father')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['parents', id],
    queryFn: () => parentService.get(id),
  })
  const portalQuery = useQuery({
    queryKey: ['parents', id, 'portal'],
    queryFn: () => parentService.portal(id),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['parents', id] })
    refetch()
  }

  const linkMut = useMutation({
    mutationFn: () => parentService.linkStudent(id, {
      student_id: studentId,
      relation,
      is_primary: true,
      is_fee_responsible: true,
      can_pickup: true,
    }),
    onSuccess: () => {
      toast.success('Student linked')
      setStudentId('')
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['parents', id, 'portal'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />

  const parent = unwrapData(data)
  const portal = unwrapData(portalQuery.data)?.data ?? unwrapData(portalQuery.data) ?? {}

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[
        { label: 'Family Hub', href: '/parents' },
        { label: 'Roster', href: '/parents/roster' },
        { label: parent.full_name },
      ]} />
      <PageHeader
        title={parent.full_name}
        subtitle={[parent.parent_code, parent.occupation].filter(Boolean).join(' · ')}
        actions={
          <>
            <Link to={`/parents/${id}/edit`}><Button variant="edit">Edit</Button></Link>
            <Button
              variant="outline"
              onClick={() => parentService.invitePortal(id).then(() => toast.success('Portal invite sent')).catch((e) => toast.error(getErrorMessage(e)))}
            >
              Invite Portal
            </Button>
            <Button
              variant="outline"
              onClick={() => parentService.sendCredentials(id, {}).then(() => toast.success('Credentials sent')).catch((e) => toast.error(getErrorMessage(e)))}
            >
              Send Credentials
            </Button>
          </>
        }
      />

      <Card>
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Avatar name={parent.full_name} src={resolveMediaUrl(parent.photo_url)} size="lg" />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text">Profile photo</label>
            <input
              type="file"
              accept="image/*"
              className="block w-full max-w-xs text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const fd = new FormData()
                fd.append('file', file)
                parentService.uploadPhoto(id, fd)
                  .then(() => {
                    toast.success('Photo uploaded')
                    invalidate()
                  })
                  .catch((err) => toast.error(getErrorMessage(err)))
                  .finally(() => { e.target.value = '' })
              }}
            />
            <p className="text-xs text-muted">Stored on R2 · JPG/PNG · max 5 MB</p>
          </div>
          <SelectField
            label="Status"
            value={parent.status}
            options={PARENT_STATUS_OPTIONS}
            onChange={(e) => parentService.update(id, { status: e.target.value }).then(invalidate)}
          />
        </div>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Code" value={parent.parent_code} />
          <Field label="Email" value={parent.email} />
          <Field label="Mobile" value={parent.mobile_number} />
          <Field label="WhatsApp" value={parent.whatsapp_number} />
          <Field label="Occupation" value={parent.occupation} />
          <Field label="Company" value={parent.company} />
          <Field label="Aadhaar" value={parent.aadhaar_number} />
          <Field label="City" value={parent.city} />
          <Field label="Communication" value={parent.communication_preference} />
          <Field label="Portal Access" value={parent.mobile_app_access ? 'Enabled' : 'Disabled'} />
        </dl>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Linked students (SIS)</h3>
        <div className="mb-4 flex flex-wrap gap-2">
          <Input
            placeholder="Student UUID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="min-w-[280px]"
          />
          <SelectField
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            options={[
              { label: 'Father', value: 'Father' },
              { label: 'Mother', value: 'Mother' },
              { label: 'Guardian', value: 'Guardian' },
              { label: 'Legal Guardian', value: 'Legal Guardian' },
            ]}
          />
          <Button loading={linkMut.isPending} onClick={() => linkMut.mutate()} disabled={!studentId}>
            Link Student
          </Button>
        </div>
        <ul className="space-y-2 text-sm">
          {(parent.linked_students || portal.students || []).map((s) => (
            <li key={s.link_id || s.student_id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <div>
                <Link className="font-medium text-primary" to={`/students/${s.student_id}`}>
                  {s.student_name || s.full_name}
                </Link>
                <div className="text-xs text-muted">
                  {[s.admission_number, s.school_name, s.class_name, s.relation].filter(Boolean).join(' · ')}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => parentService.unlinkStudent(id, { student_id: s.student_id }).then(() => { toast.success('Unlinked'); invalidate() }).catch((e) => toast.error(getErrorMessage(e)))}
              >
                Unlink
              </Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
