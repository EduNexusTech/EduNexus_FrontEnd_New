import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiX,
  FiLayout,
  FiEdit3,
  FiCpu,
  FiUserPlus,
  FiActivity,
  FiUsers,
  FiCreditCard,
  FiMail,
  FiArrowRight,
} from 'react-icons/fi'
import { cn } from '@/lib/utils'

const TEMPLATES = [
  { title: 'Admission Form', icon: FiUserPlus, color: 'text-brand-600 bg-brand-50' },
  { title: 'Sports Form', icon: FiActivity, color: 'text-emerald-600 bg-emerald-50' },
  { title: 'Parent Meeting RSVP', icon: FiUsers, color: 'text-amber-600 bg-amber-50' },
  { title: 'Fee Payment Form', icon: FiCreditCard, color: 'text-violet-600 bg-violet-50' },
  { title: 'Contact Form', icon: FiMail, color: 'text-sky-600 bg-sky-50' },
]

const METHODS = [
  {
    id: 'manual',
    title: 'Start blank',
    description: 'Drag & drop fields yourself',
    icon: FiEdit3,
  },
  {
    id: 'ai',
    title: 'Build with AI',
    description: 'Generate fields from a prompt',
    icon: FiCpu,
  },
]

export default function CreateFormModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [method, setMethod] = useState('manual')
  const [creating, setCreating] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    setName('')
    setError('')
    setMethod('manual')
    setCreating(false)
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const submit = (e) => {
    e?.preventDefault()
    if (creating) return
    const title = name.trim()
    if (!title) {
      setError('Please enter a form name')
      inputRef.current?.focus()
      return
    }
    setCreating(true)
    onCreate?.(title, { method })
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-form-title"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-border bg-gradient-to-br from-brand-50 via-white to-slate-50 px-6 py-5 pr-14">
              <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-brand-100/60" />
              <div className="pointer-events-none absolute -bottom-10 right-10 h-24 w-24 rounded-full bg-brand-50/80" />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onClose?.()
                }}
                className="absolute right-3 top-3 z-20 rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
              <div className="relative flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
                  <FiLayout className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="create-form-title" className="text-lg font-semibold text-foreground">
                    Create New Form
                  </h2>
                  <p className="text-sm text-muted-foreground">Name your form and choose how to build it</p>
                </div>
              </div>
            </div>

            <form onSubmit={submit}>
              <div className="max-h-[60vh] space-y-5 overflow-y-auto px-6 py-5">
                <div>
                  <label htmlFor="form-name" className="mb-1.5 block text-sm font-medium text-foreground">
                    Form name <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={inputRef}
                    id="form-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (error) setError('')
                    }}
                    placeholder="e.g. Admission Form, Sports Form"
                    className={cn(
                      'w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition',
                      'focus:ring-2 focus:ring-brand-500/30',
                      error ? 'border-red-400 focus:ring-red-500/20' : 'border-input focus:border-brand-400',
                    )}
                    autoComplete="off"
                  />
                  {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Start from a template
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {TEMPLATES.map((tpl) => {
                      const Icon = tpl.icon
                      const active = name.trim() === tpl.title
                      return (
                        <button
                          key={tpl.title}
                          type="button"
                          onClick={() => {
                            setName(tpl.title)
                            setError('')
                          }}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border p-2.5 text-left transition',
                            active
                              ? 'border-brand-400 bg-brand-50/60 ring-1 ring-brand-400'
                              : 'border-border hover:border-brand-300 hover:bg-muted/50',
                          )}
                        >
                          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tpl.color)}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate text-xs font-medium text-foreground">{tpl.title}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    How do you want to build it?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {METHODS.map((m) => {
                      const Icon = m.icon
                      const active = method === m.id
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setMethod(m.id)}
                          className={cn(
                            'flex flex-col gap-1 rounded-xl border p-3 text-left transition',
                            active
                              ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500'
                              : 'border-border hover:border-brand-300 hover:bg-muted/50',
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-lg',
                              active ? 'bg-brand-600 text-white' : 'bg-muted text-muted-foreground',
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-medium text-foreground">{m.title}</span>
                          <span className="text-xs text-muted-foreground">{m.description}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/30 px-6 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Form'}
                  {!creating ? <FiArrowRight className="h-4 w-4" /> : null}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
