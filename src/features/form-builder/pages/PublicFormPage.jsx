import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FiCheckCircle } from 'react-icons/fi'
import FieldRenderer from '../components/FieldRenderer'
import { getFormBySlug, saveSubmission } from '../services/formStorage'
import { isInputField } from '../utils/fieldFactory'
import NotFoundPage from '@/pages/NotFoundPage'

function buildInitialValues(fields) {
  const initial = {}
  fields.forEach((f) => {
    if (!isInputField(f.type) && f.type !== 'hidden') return
    if (f.type === 'checkbox') {
      initial[f.id] = false
    } else if (f.type === 'checkbox-group') {
      initial[f.id] = []
    } else if (f.type === 'hidden') {
      initial[f.id] = f.defaultValue ?? ''
    } else if (f.defaultValue !== undefined && f.defaultValue !== '') {
      initial[f.id] = f.defaultValue
    }
  })
  return initial
}

export default function PublicFormPage() {
  const { slug } = useParams()
  const form = getFormBySlug(slug)
  const initialValues = useMemo(() => (form ? buildInitialValues(form.fields) : {}), [form?.id])
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setValues(initialValues)
    setErrors({})
    setSubmitted(false)
  }, [initialValues])

  if (!form) return <NotFoundPage />

  const inputFields = form.fields.filter((f) => isInputField(f.type) && f.type !== 'hidden')

  const validate = () => {
    const next = {}
    inputFields.forEach((f) => {
      if (!f.required) return
      const v = values[f.id]
      if (f.type === 'checkbox') {
        if (!v) next[f.id] = 'This field is required'
        return
      }
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) {
        next[f.id] = 'This field is required'
      }
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    const payload = { ...buildInitialValues(form.fields), ...values }
    form.fields
      .filter((f) => f.type === 'hidden')
      .forEach((f) => {
        payload[f.id] = f.defaultValue ?? values[f.id] ?? ''
      })
    saveSubmission(form.id, payload)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-lg">
          <FiCheckCircle className="mx-auto h-14 w-14 text-green-500" />
          <h1 className="mt-4 text-xl font-bold">Submission received</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {form.settings?.thankYouMessage || 'Thank you for your submission!'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4">
      <div className="mx-auto max-w-xl">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-5">
            {form.fields.map((field) => {
              if (field.type === 'submit') {
                return <FieldRenderer key={field.id} field={field} mode="fill" />
              }
              if (field.type === 'reset') {
                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => {
                      setValues(buildInitialValues(form.fields))
                      setErrors({})
                    }}
                    className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {field.label}
                  </button>
                )
              }
              if (field.type === 'button') {
                return <FieldRenderer key={field.id} field={field} mode="fill" />
              }
              if (!isInputField(field.type) && field.type !== 'hidden') {
                return (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    mode="fill"
                    schoolName={form.schoolName}
                    logoUrl={form.logoUrl}
                  />
                )
              }
              if (field.type === 'hidden') {
                return <FieldRenderer key={field.id} field={field} mode="fill" />
              }
              return (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  mode="fill"
                  value={values[field.id]}
                  onChange={(v) => setValues((prev) => ({ ...prev, [field.id]: v }))}
                  error={errors[field.id]}
                  schoolName={form.schoolName}
                  logoUrl={form.logoUrl}
                />
              )
            })}
          </div>
          {!form.fields.some((f) => f.type === 'submit') ? (
            <button
              type="submit"
              className="mt-6 w-full rounded-lg bg-brand-600 py-3 text-sm font-medium text-white hover:bg-brand-700"
            >
              {form.settings?.submitLabel || 'Submit'}
            </button>
          ) : null}
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Powered by EduNexus Form Builder
        </p>
      </div>
    </div>
  )
}
