import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { schoolSettingsService } from '@/api/services'
import { unwrapData, getErrorMessage } from '@/api/client'
import { SCHOOL_SETTINGS_FIELDS, SCHOOL_SETTINGS_SECTIONS } from '@/config/constants'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import Input, { CheckboxField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { HubPageShell, SettingsNav } from '@/components/hub/HubWidgets'

export default function SchoolSettingsPage() {
  const { section = 'number_formats' } = useParams()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset } = useForm()
  const [preview, setPreview] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['school-settings', section],
    queryFn: () => schoolSettingsService.get(section),
  })

  useEffect(() => {
    if (data) reset(unwrapData(data))
  }, [data, reset])

  const mutation = useMutation({
    mutationFn: (formData) => schoolSettingsService.update(section, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-settings', section] })
      toast.success('School settings saved')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const previewMut = useMutation({
    mutationFn: () => schoolSettingsService.previewNumber({ format_key: 'admission', sequence: 1 }),
    onSuccess: (res) => setPreview(unwrapData(res)?.data?.preview || unwrapData(res)?.preview || ''),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const currentSection = SCHOOL_SETTINGS_SECTIONS.find((s) => s.key === section) || SCHOOL_SETTINGS_SECTIONS[0]
  const fields = SCHOOL_SETTINGS_FIELDS[section] || []

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />

  const settings = unwrapData(data) || {}

  return (
    <HubPageShell>
      <Breadcrumb items={[
        { label: 'School', href: '/school-profile' },
        { label: 'School Settings' },
        { label: currentSection.label },
      ]} />
      <PageHeader
        title="School Settings"
        subtitle="Configure admission formats, academic rules, fees, and channel preferences for your school"
      />

      <div className="grid gap-6 lg:grid-cols-12">
        <Card padding className="lms-form-card p-3 lg:col-span-3 xl:col-span-2">
          <SettingsNav
            items={SCHOOL_SETTINGS_SECTIONS.map((s) => ({ key: s.key, label: s.label, href: `/school-settings/${s.key}` }))}
            activeKey={section}
          />
        </Card>

        <Card className="lms-form-card lg:col-span-9 xl:col-span-10">
          <h3 className="text-lg font-semibold mb-4 text-[var(--clay-primary)]">{currentSection.label}</h3>

          {section === 'number_formats' && (
            <div className="mb-4 flex items-center gap-2">
              <Button variant="secondary" size="sm" loading={previewMut.isPending} onClick={() => previewMut.mutate()}>
                Preview Admission Number
              </Button>
              {preview && <span className="font-mono text-sm text-[var(--clay-teal)]">{preview}</span>}
            </div>
          )}

          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => {
              const val = settings[field.key]
              if (field.type === 'boolean') {
                return (
                  <CheckboxField
                    key={field.key}
                    label={field.label}
                    defaultChecked={Boolean(val)}
                    {...register(field.key)}
                  />
                )
              }
              return (
                <Input
                  key={field.key}
                  label={field.label}
                  type={field.type === 'number' ? 'number' : field.type === 'password' ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  defaultValue={val ?? ''}
                  className={field.fullWidth ? 'sm:col-span-2 lg:col-span-3' : undefined}
                  {...register(field.key)}
                />
              )
            })}

            {fields.length === 0 && Object.keys(settings).map((key) => {
              const val = settings[key]
              if (typeof val === 'boolean') {
                return <CheckboxField key={key} label={key.replace(/_/g, ' ')} defaultChecked={val} {...register(key)} />
              }
              return <Input key={key} label={key.replace(/_/g, ' ')} defaultValue={val ?? ''} {...register(key)} />
            })}

            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2 border-t border-[var(--clay-border)]">
              <Button type="submit" loading={mutation.isPending}>Save Settings</Button>
            </div>
          </form>
        </Card>
      </div>
    </HubPageShell>
  )
}
