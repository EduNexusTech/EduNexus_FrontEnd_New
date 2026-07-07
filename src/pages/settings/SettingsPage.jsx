import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { settingsService } from '@/api/services'
import { unwrapData, getErrorMessage } from '@/api/client'
import { SETTINGS_SECTIONS } from '@/config/constants'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import Input, { CheckboxField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { cn } from '@/utils/format'

export default function SettingsPage() {
  const { section = 'general' } = useParams()
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset } = useForm()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['settings', section],
    queryFn: () => settingsService.get(section),
  })

  useEffect(() => {
    if (data) reset(unwrapData(data))
  }, [data, reset])

  const mutation = useMutation({
    mutationFn: (formData) => settingsService.update(section, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', section] })
      toast.success('Settings saved')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const currentSection = SETTINGS_SECTIONS.find((s) => s.key === section) || SETTINGS_SECTIONS[0]

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />

  const settings = unwrapData(data) || {}

  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'Settings' }, { label: currentSection.label }]} />
      <PageHeader title="System Settings" subtitle="Configure platform settings (Super Admin only)" />

      <div className="grid gap-6 lg:grid-cols-12">
        <Card padding className="p-3 lg:col-span-3 xl:col-span-2">
          <nav className="space-y-1">
            {SETTINGS_SECTIONS.map((s) => (
              <Link
                key={s.key}
                to={`/settings/${s.key}`}
                className={cn(
                  'block rounded-xl px-4 py-2.5 text-sm font-medium transition',
                  section === s.key ? 'gradient-primary text-white' : 'text-muted hover:bg-slate-100 hover:text-text',
                )}
              >
                {s.label}
              </Link>
            ))}
          </nav>
        </Card>

        <Card className="lg:col-span-9 xl:col-span-10">
          <h3 className="text-lg font-semibold mb-4">{currentSection.label} Settings</h3>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(settings).map((key) => {
              const val = settings[key]
              if (typeof val === 'boolean') {
                return <CheckboxField key={key} label={key.replace(/_/g, ' ')} {...register(key)} />
              }
              return (
                <Input
                  key={key}
                  label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  defaultValue={val}
                  {...register(key)}
                />
              )
            })}
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2">
              <Button type="submit" loading={mutation.isPending}>Save Settings</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
