// Local dev: use Vite proxy (requests go to same origin /api → backend)
// Production / direct: set full URL in .env
const DEFAULT_API_URL = 'http://localhost:8000'

function normalizeBaseUrl(url) {
  return (url || '').trim().replace(/\/+$/, '')
}

function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL || import.meta.env.NEXT_PUBLIC_API_BASE_URL

  // Empty or "proxy" in dev → use Vite proxy (/api on same host)
  if (import.meta.env.DEV) {
    if (!fromEnv || fromEnv === 'proxy' || fromEnv === '/api') {
      return ''
    }
  }

  return normalizeBaseUrl(fromEnv || DEFAULT_API_URL)
}

export const APP_NAME =
  import.meta.env.VITE_APP_NAME || import.meta.env.NEXT_PUBLIC_APP_NAME || 'EduNexus ERP'

export const API_BASE_URL = resolveApiBaseUrl()

export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 30000)
export const DEFAULT_PAGE_SIZE = 20
export const AUTH_STORAGE_KEY = 'edunexus-auth'
export const TENANT_STORAGE_KEY = 'edunexus-tenant'

export const ROLE_TYPES = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Organization Admin', value: 'org_admin' },
  { label: 'School Admin', value: 'school_admin' },
  { label: 'User', value: 'user' },
]

export const SETTINGS_SECTIONS = [
  { key: 'general', label: 'General', icon: 'FiSettings' },
  { key: 'email', label: 'Email', icon: 'FiMail' },
  { key: 'sms', label: 'SMS', icon: 'FiMessageSquare' },
  { key: 'storage', label: 'Storage', icon: 'FiHardDrive' },
  { key: 'jwt', label: 'JWT', icon: 'FiKey' },
  { key: 'security', label: 'Security', icon: 'FiShield' },
  { key: 'theme', label: 'Theme', icon: 'FiDroplet' },
  { key: 'notifications', label: 'Notifications', icon: 'FiBell' },
]
