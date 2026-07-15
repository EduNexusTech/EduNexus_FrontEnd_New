import { NavLink, useLocation } from 'react-router-dom'
import {
  FiGrid,
  FiMessageSquare,
  FiGitBranch,
  FiClock,
  FiFileText,
  FiGlobe,
  FiUserCheck,
  FiSettings,
} from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useAdmissionSetup } from '../hooks/useAdmissionSetup'

const LINKS = [
  { to: '/admissions', label: 'Dashboard', icon: FiGrid, end: true, feature: null },
  {
    to: '/admissions/setup',
    label: 'Setup',
    icon: FiSettings,
    feature: null,
    adminOnly: true,
  },
  { to: '/admissions/enquiries', label: 'Enquiries', icon: FiMessageSquare, feature: 'enquiry' },
  { to: '/admissions/pipeline', label: 'Pipeline', icon: FiGitBranch, feature: 'enquiry' },
  { to: '/admissions/follow-ups', label: 'Follow-ups', icon: FiClock, feature: 'followUps' },
  {
    to: '/admissions/applications/internal',
    label: 'Internal Apps',
    icon: FiFileText,
    feature: 'internalApplication',
  },
  {
    to: '/admissions/applications/external',
    label: 'External Apps',
    icon: FiGlobe,
    feature: 'externalApplication',
  },
  { to: '/admissions/conversion', label: 'Conversion', icon: FiUserCheck, feature: 'conversion' },
]

function isLinkVisible(link, isSchoolAdmin, isSuperAdmin, isYearActive, isFeatureEnabled, pathname) {
  if (link.adminOnly && !(isSchoolAdmin || isSuperAdmin)) return false
  if (link.to === '/admissions/setup' || link.to === '/admissions') return true
  if (pathname.startsWith(link.to)) return true
  if (!isYearActive) return false
  if (!link.feature) return true
  return isFeatureEnabled(link.feature)
}

export function AdmissionsSubNav() {
  const { pathname } = useLocation()
  const { isSchoolAdmin, isSuperAdmin } = useAuth()
  const { isYearActive, isFeatureEnabled } = useAdmissionSetup()

  const visibleLinks = LINKS.filter((link) =>
    isLinkVisible(link, isSchoolAdmin, isSuperAdmin, isYearActive, isFeatureEnabled, pathname),
  )

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1 scrollbar-thin">
      {visibleLinks.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )
          }
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
