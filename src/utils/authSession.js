import { clearAuth, loadAuth, saveAuth } from '@/utils/storage'
import { isTokenExpired } from '@/utils/jwt'

/** Validate persisted session; returns null and clears storage when invalid/expired. */
export function validateStoredSession(saved) {
  if (!saved?.accessToken) return null
  if (isTokenExpired(saved.accessToken)) {
    clearAuth()
    return null
  }
  return saved
}

/** Synchronous bootstrap for initial auth state (no UI flicker on /login redirect). */
export function bootstrapStoredSession() {
  const raw = loadAuth()
  return validateStoredSession(raw)
}

export function persistAuthSession(auth, rememberMe) {
  saveAuth(
    {
      user: auth.user,
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      rememberMe,
    },
    rememberMe,
  )
}

export function readAuthSession() {
  return validateStoredSession(loadAuth())
}
