import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import Input, { Textarea, SelectField, CheckboxField, PasswordInput } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { getErrorMessage, unwrapData } from '@/api/client'

export default function ResourceFormPage({
  title,
  breadcrumb,
  queryKey,
  getFn,
  createFn,
  updateFn,
  basePath,
  fields,
  transformSubmit,
  transformLoad,
  onSuccess,
  renderExtra,
  renderTop,
}) {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm()
  const formValues = watch()

  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey, id],
    queryFn: () => getFn(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (data && isEdit) {
      const item = unwrapData(data)
      const values = transformLoad ? transformLoad(item) : item
      reset(values)
    }
  }, [data, isEdit, reset, transformLoad])

  // Clear dependent fields when their parent select changes
  useEffect(() => {
    const subscription = watch((_values, { name, type }) => {
      if (!name || (type && type !== 'change')) return
      fields.forEach((field) => {
        const parents = Array.isArray(field.dependsOn)
          ? field.dependsOn
          : field.dependsOn
            ? [field.dependsOn]
            : []
        if (parents.includes(name)) {
          setValue(field.name, '')
        }
      })
    })
    return () => subscription.unsubscribe()
  }, [watch, setValue, fields])

  const mutation = useMutation({
    mutationFn: (formData) => {
      const payload = transformSubmit ? transformSubmit(formData) : formData
      return isEdit ? updateFn(id, payload) : createFn(payload)
    },
    onSuccess: (response, formData) => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      onSuccess?.({ response, formData, isEdit })
      toast.success(isEdit ? 'Updated successfully' : 'Created successfully')
      navigate(basePath)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const renderField = (field) => {
    const isDisabled =
      (isEdit && field.readOnlyOnEdit) ||
      (typeof field.disabled === 'function' ? field.disabled(formValues) : Boolean(field.disabled))

    const common = {
      key: field.name,
      label: field.label,
      error: errors[field.name]?.message,
      required: field.required,
      disabled: isDisabled,
      ...register(field.name, {
        required: field.required ? `${field.label} is required` : false,
        valueAsNumber: field.type === 'number',
      }),
    }

    switch (field.type) {
      case 'textarea':
        return <Textarea {...common} placeholder={field.placeholder} />
      case 'select': {
        const options =
          typeof field.getOptions === 'function'
            ? field.getOptions(formValues)
            : (field.options || [])
        return (
          <SelectField
            {...common}
            options={options}
            placeholder={field.placeholder}
          />
        )
      }
      case 'checkbox':
        return <CheckboxField label={field.label} {...register(field.name)} />
      case 'password':
        return <PasswordInput {...common} />
      case 'email':
        return <Input {...common} type="email" />
      case 'date':
        return <Input {...common} type="date" />
      case 'number':
        return <Input {...common} type="number" />
      default:
        return <Input {...common} type="text" placeholder={field.placeholder} />
    }
  }

  if (isEdit && isLoading) return <PageLoader />
  if (isEdit && error) return <ErrorState message={getErrorMessage(error)} />

  return (
    <div className="lms-page w-full">
      <Breadcrumb items={breadcrumb || [{ label: title, href: basePath }, { label: isEdit ? 'Edit' : 'New' }]} />
      <PageHeader title={isEdit ? `Edit ${title}` : `New ${title}`} />

      <Card className="w-full lms-form-card">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-4 p-1 [grid-template-columns:minmax(0,1fr)] sm:[grid-template-columns:repeat(2,minmax(0,1fr))] lg:[grid-template-columns:repeat(3,minmax(0,1fr))]">
          {renderTop ? (
            <div className="sm:col-span-2 lg:col-span-3">
              {renderTop({
                isEdit,
                item: isEdit && data ? unwrapData(data) : null,
              })}
            </div>
          ) : null}
          {fields.map((field) => (
            <div key={field.name} className={field.fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''}>
              {renderField(field)}
            </div>
          ))}
          {renderExtra ? (
            <div className="sm:col-span-2 lg:col-span-3">
              {renderExtra({
                isEdit,
                item: isEdit && data ? unwrapData(data) : null,
              })}
            </div>
          ) : null}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3 pt-4 border-t border-[var(--clay-border)]">
            <Button type="submit" variant="primary" loading={mutation.isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="cancel" onClick={() => navigate(basePath)}>
              Cancel
            </Button>
            <Button type="button" variant="ghost" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export function ResourceDetailPage({
  title,
  breadcrumb,
  queryKey,
  getFn,
  basePath,
  fields,
  actions,
  renderExtra,
  renderTop,
}) {
  const { id } = useParams()
  const { data, isLoading, error } = useQuery({
    queryKey: [queryKey, id],
    queryFn: () => getFn(id),
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} />

  const item = unwrapData(data)

  return (
    <div className="lms-page w-full">
      <Breadcrumb items={breadcrumb || [{ label: title, href: basePath }, { label: 'Details' }]} />
      <PageHeader
        title={`${title} Details`}
        actions={
          <>
            {actions?.(item)}
            <Button variant="back" onClick={() => window.history.back()}>Back</Button>
          </>
        }
      />
      <Card className="w-full">
        {renderTop?.(item)}
        <dl className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${renderTop ? 'mt-6 border-t border-border pt-6' : ''}`}>
          {fields.map((f) => (
            <div key={f.key}>
              <dt className="text-xs font-medium uppercase tracking-wider text-[var(--clay-primary-soft)]">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--clay-primary)]">
                {f.render ? f.render(item) : item[f.key] ?? '—'}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
      {renderExtra?.(item)}
    </div>
  )
}
