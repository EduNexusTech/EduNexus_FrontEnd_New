import { AUTH_LOGOUT_KEY, AUTH_STORAGE_KEY, TENANT_STORAGE_KEY } from '@/config/constants'

export function getStorage(rememberMe) {
  return rememberMe ? localStorage : sessionStorage
}

export function loadAuth() {
  try {
    const local = localStorage.getItem(AUTH_STORAGE_KEY)
    if (local) return JSON.parse(local)
    const session = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (session) return JSON.parse(session)
  } catch {
    return null
  }
  return null
}

/** Synchronous token read for axios — avoids React state timing gaps after login */
export function getStoredAccessToken() {
  return loadAuth()?.accessToken || null
}

export function getStoredRefreshToken() {
  return loadAuth()?.refreshToken || null
}

export function getStoredUser() {
  return loadAuth()?.user || null
}

export function getStoredRememberMe() {
  return Boolean(loadAuth()?.rememberMe)
}

/**
 * Persist auth for cross-tab sync:
 * - rememberMe: localStorage only (survives browser restart)
 * - session: sessionStorage + localStorage mirror (syncs tabs in same browser)
 */
export function saveAuth(auth, rememberMe) {
  const payload = { ...auth, rememberMe: Boolean(rememberMe) }
  const json = JSON.stringify(payload)

  if (rememberMe) {
    localStorage.setItem(AUTH_STORAGE_KEY, json)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
  } else {
    sessionStorage.setItem(AUTH_STORAGE_KEY, json)
    localStorage.setItem(AUTH_STORAGE_KEY, json)
  }

  try {
    localStorage.removeItem(AUTH_LOGOUT_KEY)
  } catch {
    // ignore
  }
}

export function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
  try {
    localStorage.setItem(AUTH_LOGOUT_KEY, String(Date.now()))
  } catch {
    // ignore
  }
}

export function loadTenant() {
  try {
    const data = localStorage.getItem(TENANT_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function saveTenant(tenant) {
  localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(tenant))
}

export function clearTenant() {
  localStorage.removeItem(TENANT_STORAGE_KEY)
}
