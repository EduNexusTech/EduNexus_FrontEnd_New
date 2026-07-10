import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageHeader, Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input, { SelectField, Textarea } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { communicationService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import {
  COMMUNICATION_AUDIENCE_OPTIONS,
  COMMUNICATION_CATEGORY_OPTIONS,
  COMMUNICATION_CHANNEL_OPTIONS,
} from '@/config/constants'

function MultiCheckbox({ label, options, values, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-text">{label}</p>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={values.includes(opt.value)}
              onChange={(e) => {
                if (e.target.checked) onChange([...values, opt.value])
                else onChange(values.filter((v) => v !== opt.value))
              }}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  )
}

export default function CommunicationMessageForm() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    category: searchParams.get('category') || 'announcement',
    title: '',
    subject: '',
    body: '',
    channels: ['push'],
    audiences: ['students'],
    scheduled_at: '',
  })
  const [preview, setPreview] = useState(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['communication-messages', id],
    queryFn: () => communicationService.messages.get(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (data && isEdit) {
      const item = unwrapData(data)
      setForm({
        category: item.category || 'announcement',
        title: item.title || '',
        subject: item.subject || '',
        body: item.body || '',
        channels: item.channels || ['push'],
        audiences: item.audiences || ['students'],
        scheduled_at: item.scheduled_at ? item.scheduled_at.slice(0, 16) : '',
      })
    }
  }, [data, isEdit])

  const saveMut = useMutation({
    mutationFn: () => (isEdit
      ? communicationService.messages.update(id, form)
      : communicationService.messages.create(form)),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['communication-messages'] })
      toast.success(isEdit ? 'Message updated' : 'Message created')
      const saved = unwrapData(res)
      navigate(`/communications/messages/${saved.message_id || saved.id || id}`)
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const previewMut = useMutation({
    mutationFn: () => communicationService.messages.previewAudience({
      audiences: form.audiences,
    }),
    onSuccess: (res) => setPreview(unwrapData(res)?.data || unwrapData(res)),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isEdit && isLoading) return <PageLoader />
  if (isEdit && error) return <ErrorState message={getErrorMessage(error)} />

  return (
    <div className="w-full space-y-6">
      <Breadcrumb items={[
        { label: 'Communications', href: '/communications' },
        { label: 'Messages', href: '/communications/messages' },
        { label: isEdit ? 'Edit' : 'Compose' },
      ]} />
      <PageHeader title={isEdit ? 'Edit Message' : 'Compose Message'} subtitle="Multi-channel school communication" />

      <Card>
        <div className="grid gap-4 max-w-3xl">
          <SelectField
            label="Type"
            value={form.category}
            options={COMMUNICATION_CATEGORY_OPTIONS}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
          />
          <Input label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <Input label="Email Subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} />
          <Textarea label="Message Body" value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} rows={6} required />
          <MultiCheckbox
            label="Channels"
            options={COMMUNICATION_CHANNEL_OPTIONS}
            values={form.channels}
            onChange={(channels) => setForm((p) => ({ ...p, channels }))}
          />
          <MultiCheckbox
            label="Audience"
            options={COMMUNICATION_AUDIENCE_OPTIONS}
            values={form.audiences}
            onChange={(audiences) => setForm((p) => ({ ...p, audiences }))}
          />
          <Input
            label="Schedule (optional)"
            type="datetime-local"
            value={form.scheduled_at}
            onChange={(e) => setForm((p) => ({ ...p, scheduled_at: e.target.value }))}
          />
        </div>

        {preview && (
          <div className="mt-4 rounded-lg border border-border bg-slate-50 p-3 text-sm">
            <p className="font-medium">Audience preview: {preview.count} recipients</p>
            <ul className="mt-2 text-muted">
              {(preview.sample || []).map((s) => (
                <li key={s.user_id}>{s.full_name} — {s.email || s.mobile}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="secondary" loading={previewMut.isPending} onClick={() => previewMut.mutate()}>
            Preview Audience
          </Button>
          <Button loading={saveMut.isPending} onClick={() => saveMut.mutate()}>
            {isEdit ? 'Save Changes' : 'Save Draft'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/communications/messages')}>Cancel</Button>
        </div>
      </Card>
    </div>
  )
}
