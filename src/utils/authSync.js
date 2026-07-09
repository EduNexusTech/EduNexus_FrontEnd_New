import { AUTH_STORAGE_KEY, AUTH_REVISION_KEY } from '@/config/constants'

export const AUTH_SYNC_CHANNEL = 'edunexus-auth-sync'

export const AuthSyncEvent = {
  UPDATED: 'auth-updated',
  LOGOUT: 'auth-logout',
}

const TAB_ID =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `tab-${Date.now()}-${Math.random().toString(36).slice(2)}`

let channel = null

try {
  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(AUTH_SYNC_CHANNEL)
  }
} catch {
  channel = null
}

/** Notify other browser tabs that auth storage changed. */
export function notifyAuthSync(event = AuthSyncEvent.UPDATED) {
  try {
    localStorage.setItem(AUTH_REVISION_KEY, String(Date.now()))
  } catch {
    // ignore quota / private mode
  }

  try {
    channel?.postMessage({ event, tabId: TAB_ID, at: Date.now() })
  } catch {
    // ignore
  }
}

/** Listen for auth changes from other tabs (login, logout, token refresh). */
export function subscribeAuthSync(onSync) {
  const handleMessage = (message) => {
    if (message?.data?.tabId === TAB_ID) return
    onSync(message.data)
  }

  const handleStorage = (event) => {
    if (event.key === AUTH_REVISION_KEY || event.key === AUTH_STORAGE_KEY) {
      onSync({ event: AuthSyncEvent.UPDATED, fromStorage: true })
    }
  }

  channel?.addEventListener('message', handleMessage)
  window.addEventListener('storage', handleStorage)

  return () => {
    channel?.removeEventListener('message', handleMessage)
    window.removeEventListener('storage', handleStorage)
  }
}

export function getTabId() {
  return TAB_ID
}
