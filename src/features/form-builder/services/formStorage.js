import { formService } from '@/api/services'
import { unwrapData, unwrapList } from '@/api/client'

export function getPublicFormUrl(slug) {
  if (typeof window === 'undefined') return `/f/${slug}`
  return `${window.location.origin}/f/${slug}`
}

async function unwrapForm(response) {
  return unwrapData(response)
}

async function unwrapFormList(response) {
  const payload = unwrapData(response)
  if (Array.isArray(payload)) return payload
  if (payload?.results) return payload.results
  return unwrapList(response).results
}

export async function listForms(params) {
  const response = await formService.list(params)
  return unwrapFormList(response)
}

export async function getFormById(id) {
  if (!id) return null
  try {
    const response = await formService.get(id)
    return unwrapForm(response)
  } catch {
    return null
  }
}

export async function getFormBySlug(slug) {
  if (!slug) return null
  try {
    const response = await formService.getPublic(slug)
    return unwrapForm(response)
  } catch {
    return null
  }
}

export async function saveForm(form) {
  if (!form?.id) {
    console.warn('[formStorage] saveForm skipped: missing form.id')
    return null
  }
  const response = await formService.save(form.id, form)
  return unwrapForm(response)
}

export async function deleteForm(id) {
  if (!id) return
  await formService.delete(id)
}

export async function createEmptyForm(partial = {}) {
  const title = String(partial.title || 'Untitled Form').trim() || 'Untitled Form'
  const response = await formService.create({
    title,
    formName: partial.formName || title,
    description: partial.description || '',
    schoolName: partial.schoolName || '',
    logoUrl: partial.logoUrl || '',
    headerSubtitle: partial.headerSubtitle || '',
    fields: partial.fields || [],
    settings: {
      thankYouMessage: 'Thank you! Your response has been submitted successfully.',
      submitLabel: 'Submit',
      showBranding: true,
      ...(partial.settings || {}),
    },
  })
  return unwrapForm(response)
}

export async function publishForm(id) {
  const response = await formService.publish(id)
  return unwrapForm(response)
}

export async function unpublishForm(id) {
  const response = await formService.unpublish(id)
  return unwrapForm(response)
}

export async function listSubmissions(formId) {
  const response = await formService.listSubmissions(formId)
  const payload = unwrapData(response)
  if (Array.isArray(payload)) return payload
  return payload?.results || unwrapList(response).results || []
}

export async function saveSubmission(_formId, data, slug) {
  if (!slug) throw new Error('Form slug is required for public submission')
  const response = await formService.submitPublic(slug, data)
  return unwrapForm(response)
}

export async function duplicateForm(id) {
  const response = await formService.duplicate(id)
  return unwrapForm(response)
}
