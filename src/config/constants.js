// Local (npm run dev): http://127.0.0.1:8000
// Live (npm run build): https://edunexusbackend-production.up.railway.app
const LOCAL_API_URL = 'http://127.0.0.1:8000'
const PRODUCTION_API_URL = 'https://edunexusbackend-production.up.railway.app'

function normalizeBaseUrl(url) {
  return (url || '').trim().replace(/\/+$/, '')
}

function resolveApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_API_BASE_URL || import.meta.env.NEXT_PUBLIC_API_BASE_URL

  // Explicit override (skip empty / proxy sentinel values)
  if (fromEnv && fromEnv !== 'proxy' && fromEnv !== '/api') {
    return normalizeBaseUrl(fromEnv)
  }

  // Vite: import.meta.env.DEV === true when running `npm run dev`
  if (import.meta.env.DEV) {
    return LOCAL_API_URL
  }

  return PRODUCTION_API_URL
}

export const APP_NAME =
  import.meta.env.VITE_APP_NAME || import.meta.env.NEXT_PUBLIC_APP_NAME || 'EduNexus ERP'

export const API_BASE_URL = resolveApiBaseUrl()

export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 30000)
export const DEFAULT_PAGE_SIZE = 20
export const AUTH_STORAGE_KEY = 'edunexus-auth'
export const AUTH_REVISION_KEY = 'edunexus-auth-rev'
export const TENANT_STORAGE_KEY = 'edunexus-tenant'

export const ROLE_TYPES = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Organization Admin', value: 'org_admin' },
  { label: 'School Admin', value: 'school_admin' },
  { label: 'User', value: 'user' },
]

export const SCHOOL_STAFF_ROLES = [
  { label: 'Teacher', value: 'teacher' },
  { label: 'Parent', value: 'parent' },
  { label: 'Student', value: 'student' },
  { label: 'Staff', value: 'staff' },
  { label: 'Receptionist', value: 'receptionist' },
  { label: 'Librarian', value: 'librarian' },
  { label: 'Transport Manager', value: 'transport_manager' },
  { label: 'Accountant', value: 'accountant' },
  { label: 'Nurse', value: 'nurse' },
  { label: 'HR Manager', value: 'hr_manager' },
  { label: 'Sports Coach', value: 'sports_coach' },
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
