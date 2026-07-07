import axiosInstance from './axios'

export function buildQuery(params = {}) {
  const query = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query[key] = value
    }
  })
  return query
}

export async function apiGet(url, params, config) {
  const response = await axiosInstance.get(url, { params: buildQuery(params), ...config })
  return response.data
}

export async function apiGetPaginated(url, params, config) {
  const response = await axiosInstance.get(url, { params: buildQuery(params), ...config })
  return response.data
}

export async function apiPost(url, body, config) {
  const response = await axiosInstance.post(url, body, config)
  return response.data
}

export async function apiPatch(url, body, config) {
  const response = await axiosInstance.patch(url, body, config)
  return response.data
}

export async function apiPut(url, body, config) {
  const response = await axiosInstance.put(url, body, config)
  return response.data
}

export async function apiDelete(url, config) {
  const response = await axiosInstance.delete(url, config)
  return response.data
}

export async function apiGetBlob(url, params) {
  const response = await axiosInstance.get(url, {
    params: buildQuery(params),
    responseType: 'blob',
  })
  return response.data
}

export function unwrapData(response) {
  if (!response || typeof response !== 'object') return response

  // { status, message, data } envelope from api_response()
  if (response.data !== undefined && (response.status !== undefined || response.message !== undefined)) {
    return response.data
  }

  // { success, data } variant
  if (response.success === true && response.data !== undefined) {
    return response.data
  }

  return response
}

export function unwrapList(response) {
  const raw = response?.data !== undefined && response?.results === undefined ? response : unwrapData(response)

  if (Array.isArray(raw)) return { results: raw, count: raw.length }

  // Paginated: { success, count, results } or { count, results }
  if (raw?.results) {
    return {
      results: raw.results,
      count: raw.count ?? raw.results.length,
      next: raw.next,
      previous: raw.previous,
    }
  }

  if (raw?.data?.results) {
    return {
      results: raw.data.results,
      count: raw.data.count ?? raw.data.results.length,
    }
  }

  return { results: [], count: 0 }
}

export function getErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data
  const status = error?.response?.status

  if (typeof data === 'string' && data.trim()) return data

  if (typeof data?.message === 'string' && data.message) return data.message
  if (typeof data?.detail === 'string' && data.detail) return data.detail

  // Backend custom handler: { success: false, error: { message, details } }
  if (typeof data?.error?.message === 'string' && data.error.message) {
    return data.error.message
  }

  if (status === 403) return 'You do not have permission to access this resource.'
  if (status === 401) return 'Session expired. Please sign in again.'
  if (status === 404) {
    return 'API route not found. Start the Django backend (python manage.py runserver) or check VITE_API_BASE_URL.'
  }

  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return 'Cannot reach the backend API. Start Django on port 8000 or use the deployed Railway URL in .env.'
  }

  if (typeof data === 'object' && data !== null) {
    const firstKey = Object.keys(data)[0]
    if (firstKey) {
      const val = data[firstKey]
      if (Array.isArray(val) && val[0]) return String(val[0])
      if (typeof val === 'string') return val
    }
  }

  if (error?.message && !error.message.startsWith('Request failed with status code')) {
    return error.message
  }

  return fallback
}
