import { useState } from 'react'
import { FiCheck, FiCopy, FiExternalLink, FiLink } from 'react-icons/fi'
import { getPublicFormUrl } from '../services/formStorage'
import toast from 'react-hot-toast'

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(el)
      return ok
    } catch {
      return false
    }
  }
}

export default function PublishSuccessPanel({ form, onClose }) {
  const [copied, setCopied] = useState(false)
  const url = getPublicFormUrl(form.slug)

  const copy = async () => {
    const ok = await copyText(url)
    if (!ok) {
      toast.error('Could not copy URL — select and copy manually')
      return
    }
    setCopied(true)
    toast.success('Form URL copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-6">
      <div className="flex items-center gap-2 text-green-800">
        <FiCheck className="h-5 w-5" />
        <h3 className="font-semibold">Form published successfully!</h3>
      </div>
      <p className="mt-2 text-sm text-green-700">
        Share this link with parents. They can open it without logging in and submit responses.
      </p>
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-white p-3">
        <FiLink className="h-4 w-4 shrink-0 text-muted-foreground" />
        <code className="flex-1 truncate text-sm text-foreground">{url}</code>
        <button type="button" onClick={copy} className="rounded-lg p-2 hover:bg-muted" title="Copy URL">
          {copied ? <FiCheck className="h-4 w-4 text-green-600" /> : <FiCopy className="h-4 w-4" />}
        </button>
        <a
          href={`/f/${form.slug}`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg p-2 hover:bg-muted"
          title="Open form"
        >
          <FiExternalLink className="h-4 w-4" />
        </a>
      </div>
      {onClose ? (
        <button type="button" onClick={onClose} className="mt-4 text-sm font-medium text-brand-600 hover:underline">
          Continue editing
        </button>
      ) : null}
    </div>
  )
}
