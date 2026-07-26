/** JWT helpers — client-side expiry checks only; API always validates server-side. */

export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null
  try {
    const segment = token.split('.')[1]
    if (!segment) return null
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function getTokenExpiryMs(token) {
  const payload = decodeJwtPayload(token)
  if (!payload?.exp) return null
  return payload.exp * 1000
}

/** True when token is expired or within leeway seconds of expiry. */
export function isTokenExpired(token, leewaySeconds = 30) {
  const expMs = getTokenExpiryMs(token)
  if (expMs == null) return false
  return Date.now() >= expMs - leewaySeconds * 1000
}

export function getTokenSubject(token) {
  return decodeJwtPayload(token)?.sub ?? decodeJwtPayload(token)?.user_id ?? null
}

/** True when refresh token is expired (no leeway by default). */
export function isRefreshTokenExpired(token, leewaySeconds = 0) {
  return isTokenExpired(token, leewaySeconds)
}
