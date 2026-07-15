import { FORM_STORAGE_KEY, SUBMISSION_STORAGE_KEY } from '../types'
import { createId } from '../utils/createId'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function slugify(text) {
  return String(text || 'form')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'form'
}

function uniqueSlug(base, existing, excludeId = null) {
  let slug = slugify(base)
  let i = 1
  while (existing.some((f) => f.slug === slug && f.id !== excludeId)) {
    slug = `${slugify(base)}-${i++}`
  }
  return slug
}

/** Keep one entry per id (newest updatedAt wins). */
function dedupeById(forms) {
  const map = new Map()
  for (const form of forms) {
    if (!form?.id) continue
    const prev = map.get(form.id)
    if (!prev || String(form.updatedAt || '') >= String(prev.updatedAt || '')) {
      map.set(form.id, form)
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')),
  )
}

export function listForms() {
  const raw = readJson(FORM_STORAGE_KEY, [])
  const forms = dedupeById(Array.isArray(raw) ? raw : [])
  // Heal storage only when duplicates or invalid entries were present
  if (forms.length !== (Array.isArray(raw) ? raw.filter((f) => f?.id).length : 0) || forms.length !== raw.length) {
    writeJson(FORM_STORAGE_KEY, forms)
  }
  return forms
}

export function getFormById(id) {
  if (!id) return null
  return listForms().find((f) => f.id === id) ?? null
}

export function getFormBySlug(slug) {
  return listForms().find((f) => f.slug === slug && f.status === 'published') ?? null
}

/**
 * Upsert by id only. Never inserts a second copy of the same form.
 * Requires a valid form.id — otherwise returns null and does nothing.
 */
export function saveForm(form) {
  if (!form?.id) {
    console.warn('[formStorage] saveForm skipped: missing form.id')
    return null
  }

  const forms = listForms()
  const idx = forms.findIndex((f) => f.id === form.id)
  const next = {
    ...form,
    id: form.id,
    updatedAt: new Date().toISOString(),
  }

  if (idx >= 0) {
    forms[idx] = next
  } else {
    forms.unshift(next)
  }

  writeJson(FORM_STORAGE_KEY, dedupeById(forms))
  return next
}

export function deleteForm(id) {
  if (!id) return
  writeJson(FORM_STORAGE_KEY, listForms().filter((f) => f.id !== id))
}

export function createEmptyForm(partial = {}) {
  const forms = listForms()
  const title = String(partial.title || 'Untitled Form').trim() || 'Untitled Form'
  const id = partial.id || createId('form')
  const now = new Date().toISOString()
  return {
    id,
    slug: uniqueSlug(title, forms, id),
    formName: title,
    title,
    description: partial.description || '',
    status: 'draft',
    schoolName: partial.schoolName || 'EduNexus School',
    logoUrl: partial.logoUrl || '',
    headerSubtitle: partial.headerSubtitle || '',
    fields: partial.fields || [],
    settings: {
      thankYouMessage: 'Thank you! Your response has been submitted successfully.',
      submitLabel: 'Submit',
      showBranding: true,
      ...(partial.settings || {}),
    },
    createdAt: now,
    updatedAt: now,
  }
}

export function publishForm(id) {
  const form = getFormById(id)
  if (!form) return null
  return saveForm({
    ...form,
    status: 'published',
    publishedAt: new Date().toISOString(),
  })
}

export function getPublicFormUrl(slug) {
  if (typeof window === 'undefined') return `/f/${slug}`
  return `${window.location.origin}/f/${slug}`
}

export function listSubmissions(formId) {
  return readJson(SUBMISSION_STORAGE_KEY, []).filter((s) => s.formId === formId)
}

export function saveSubmission(formId, data) {
  const all = readJson(SUBMISSION_STORAGE_KEY, [])
  const submission = {
    id: createId('sub'),
    formId,
    data,
    submittedAt: new Date().toISOString(),
  }
  all.unshift(submission)
  writeJson(SUBMISSION_STORAGE_KEY, all)
  return submission
}
