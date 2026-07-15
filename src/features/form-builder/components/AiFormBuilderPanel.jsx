import { useState } from 'react'
import { FiCpu, FiLoader, FiZap } from 'react-icons/fi'
import { generateFormFromPrompt } from '../services/aiFormGenerator'

const SUGGESTIONS = [
  'Create an admission enquiry form for new students',
  'Build a parent meeting RSVP form',
  'Design a contact and feedback form',
  'Create an event registration form',
  'Build a fee payment submission form',
]

export default function AiFormBuilderPanel({ onGenerated, schoolName }) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)

  const run = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    const result = generateFormFromPrompt(prompt, { schoolName })
    onGenerated?.(result)
    setLoading(false)
    setPrompt('')
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          <FiCpu className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground">AI Form Builder</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Describe the form you need — fields are generated instantly. Backend AI can be connected later.
          </p>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Create an admission form with student name, class, parent details, and document upload..."
            className="mt-3 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrompt(s)}
                className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs text-brand-700 hover:bg-brand-50"
              >
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={run}
            disabled={loading || !prompt.trim()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiZap className="h-4 w-4" />}
            Generate Form
          </button>
        </div>
      </div>
    </div>
  )
}
