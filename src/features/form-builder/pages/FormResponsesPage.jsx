import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FiArrowLeft, FiChevronDown, FiChevronUp, FiEdit2, FiInbox } from 'react-icons/fi'
import Card from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getFormById, listSubmissions } from '../services/formStorage'
import { isInputField } from '../utils/fieldFactory'
import { getErrorMessage } from '@/api/client'
import NotFoundPage from '@/pages/NotFoundPage'
import toast from 'react-hot-toast'

function formatSubmittedAt(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function formatFieldValue(field, raw) {
  if (raw === undefined || raw === null || raw === '') return '—'

  if (field?.type === 'checkbox') {
    return raw ? 'Yes' : 'No'
  }

  if (field?.type === 'checkbox-group' && Array.isArray(raw)) {
    return raw.length ? raw.join(', ') : '—'
  }

  if (Array.isArray(raw)) {
    return raw.length ? raw.join(', ') : '—'
  }

  if (typeof raw === 'object') {
    return JSON.stringify(raw)
  }

  return String(raw)
}

function getReportFields(form) {
  return (form?.fields || []).filter(
    (field) => isInputField(field.type) && field.type !== 'hidden' && field.type !== 'submit',
  )
}

export default function FormResponsesPage() {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    let active = true

    ;(async () => {
      setLoading(true)
      try {
        const row = await getFormById(id)
        if (!active) return
        if (!row) {
          setForm(null)
          setSubmissions([])
          setLoading(false)
          return
        }

        setForm(row)
        const rows = await listSubmissions(id)
        if (active) {
          const list = Array.isArray(rows) ? rows : []
          setSubmissions(list)
          if (list[0]?.id) setExpandedId(list[0].id)
          setLoading(false)
        }
      } catch (error) {
        if (active) {
          toast.error(getErrorMessage(error, 'Could not load responses'))
          setSubmissions([])
          setLoading(false)
        }
      }
    })()

    return () => {
      active = false
    }
  }, [id])

  const reportFields = useMemo(() => getReportFields(form), [form])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading responses…
      </div>
    )
  }

  if (!form) return <NotFoundPage />

  const displayName = form.formName || form.title || 'Untitled Form'

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/form-builder"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <FiArrowLeft className="h-4 w-4" /> Back to forms
        </Link>
        <Link
          to={`/form-builder/${id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted"
        >
          <FiEdit2 className="h-4 w-4" /> Edit form
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Response report — {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Badge variant={form.status === 'published' ? 'success' : 'warning'}>{form.status}</Badge>
      </div>

      {submissions.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <FiInbox className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No responses yet</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Share the published form link with parents. Submissions will appear here automatically.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission, index) => {
            const isExpanded = expandedId === submission.id
            const responseNumber = submissions.length - index

            return (
              <Card key={submission.id} className="!p-0 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted/40"
                >
                  <div>
                    <p className="font-medium">Response #{responseNumber}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Submitted {formatSubmittedAt(submission.submittedAt)}
                    </p>
                  </div>
                  {isExpanded ? (
                    <FiChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                  ) : (
                    <FiChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {isExpanded ? (
                  <div className="border-t border-border px-5 py-4">
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {reportFields.map((field) => (
                        <div key={field.id} className="min-w-0">
                          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {field.label || field.type}
                          </dt>
                          <dd className="mt-1 break-words text-sm text-foreground">
                            {formatFieldValue(field, submission.data?.[field.id])}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : (
                  <div className="border-t border-border px-5 py-3">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      {reportFields.slice(0, 3).map((field) => (
                        <div key={field.id} className="min-w-0 max-w-full">
                          <span className="text-muted-foreground">{field.label}: </span>
                          <span className="font-medium">
                            {formatFieldValue(field, submission.data?.[field.id])}
                          </span>
                        </div>
                      ))}
                      {reportFields.length > 3 ? (
                        <span className="text-muted-foreground">
                          +{reportFields.length - 3} more field{reportFields.length - 3 !== 1 ? 's' : ''}
                        </span>
                      ) : null}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
