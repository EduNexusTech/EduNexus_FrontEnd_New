import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiShield,
  FiMenu,
  FiDatabase,
  FiSettings,
  FiFileText,
  FiBell,
  FiChevronLeft,
  FiLayers,
  FiBook,
  FiClipboard,
  FiUserCheck,
  FiMail,
  FiCpu,
  FiMessageSquare,
  FiZap,
} from 'react-icons/fi'
import { APP_NAME } from '@/config/constants'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/utils/format'

const iconMap = {
  dashboard: FiGrid,
  organizations: FiBriefcase,
  schools: FiBook,
  users: FiUsers,
  roles: FiShield,
  permissions: FiShield,
  menus: FiMenu,
  modules: FiLayers,
  masters: FiDatabase,
  'audit-logs': FiFileText,
  settings: FiSettings,
  notifications: FiBell,
  memberships: FiUsers,
  'user-roles': FiShield,
}

const superAdminNav = [
  { label: 'Dashboard', path: '/dashboard', icon: FiGrid },
  {
    label: 'Management',
    children: [
      { label: 'Organizations', path: '/organizations', icon: FiBriefcase },
      { label: 'Schools', path: '/schools', icon: FiBook },
      { label: 'Users', path: '/users', icon: FiUsers },
      { label: 'Memberships', path: '/memberships', icon: FiUsers },
    ],
  },
  {
    label: 'Access Control',
    children: [
      { label: 'Roles', path: '/roles', icon: FiShield },
      { label: 'Permissions', path: '/permissions', icon: FiShield },
      { label: 'User Roles', path: '/user-roles', icon: FiShield },
      { label: 'Modules', path: '/modules', icon: FiLayers },
      { label: 'Menus', path: '/menus', icon: FiMenu },
    ],
  },
  {
    label: 'Master Data',
    children: [
      { label: 'Masters Hub', path: '/masters', icon: FiDatabase },
      { label: 'Academic Structure', path: '/academics', icon: FiBook },
    ],
  },
  {
    label: 'AI & Automation',
    children: [
      { label: 'AI Hub', path: '/ai-hub', icon: FiCpu },
      { label: 'Nexus AI', path: '/ai-hub/assistant', icon: FiMessageSquare },
      { label: 'Automations', path: '/ai-hub/automations', icon: FiZap },
    ],
  },
  {
    label: 'System',
    children: [
      { label: 'EduNexus Post', path: '/edu-nexus-post', icon: FiMail },
      { label: 'Audit Logs', path: '/audit-logs', icon: FiFileText },
      { label: 'Settings', path: '/settings', icon: FiSettings },
      { label: 'Notifications', path: '/notifications', icon: FiBell },
    ],
  },
]

const orgAdminNav = [
  { label: 'Dashboard', path: '/dashboard', icon: FiGrid },
  {
    label: 'Management',
    children: [
      { label: 'Schools', path: '/schools', icon: FiBook },
      { label: 'Users', path: '/users', icon: FiUsers },
      { label: 'Memberships', path: '/memberships', icon: FiUsers },
    ],
  },
  {
    label: 'Access Control',
    children: [
      { label: 'Roles', path: '/roles', icon: FiShield },
      { label: 'User Roles', path: '/user-roles', icon: FiShield },
    ],
  },
  {
    label: 'Master Data',
    children: [
      { label: 'Masters Hub', path: '/masters', icon: FiDatabase },
      { label: 'Academic Structure', path: '/academics', icon: FiBook },
    ],
  },
  {
    label: 'System',
    children: [
      { label: 'Audit Logs', path: '/audit-logs', icon: FiFileText },
      { label: 'Notifications', path: '/notifications', icon: FiBell },
    ],
  },
]

const schoolAdminNav = [
  { label: 'Dashboard', path: '/dashboard', icon: FiGrid },
  {
    label: 'School',
    children: [
      { label: 'School Profile', path: '/school-profile', icon: FiBook },
      { label: 'School Settings', path: '/school-settings', icon: FiSettings },
      { label: 'School Masters', path: '/school-masters', icon: FiDatabase },
    ],
  },
  {
    label: 'Management',
    children: [
      { label: 'Admissions', path: '/admissions', icon: FiClipboard },
      { label: 'Students', path: '/students', icon: FiUsers },
      { label: 'Teachers', path: '/teachers', icon: FiUserCheck },
      { label: 'Parents', path: '/parents', icon: FiUsers },
      { label: 'Staff', path: '/staff', icon: FiUserCheck },
      { label: 'Communications', path: '/communications', icon: FiMail },
      { label: 'School Users', path: '/school-users', icon: FiUsers },
    ],
  },
  {
    label: 'Master Data',
    children: [
      { label: 'Masters Hub', path: '/masters', icon: FiDatabase },
      { label: 'Academic Structure', path: '/academics', icon: FiBook },
    ],
  },
  {
    label: 'System',
    children: [
      { label: 'Audit Logs', path: '/audit-logs', icon: FiFileText },
      { label: 'Notifications', path: '/notifications', icon: FiBell },
    ],
  },
]

function resolveNav({ isSuperAdmin, isOrgAdmin, isSchoolAdmin }) {
  if (isSuperAdmin) return superAdminNav
  if (isSchoolAdmin) return schoolAdminNav
  if (isOrgAdmin) return orgAdminNav
  return schoolAdminNav
}

function isNavItemActive(pathname, itemPath) {
  if (itemPath === '/ai-hub') return pathname === '/ai-hub'
  if (itemPath === '/school-profile') {
    return pathname === '/school-profile' || /^\/schools\/[^/]+\/profile/.test(pathname)
  }
  if (itemPath === '/school-settings') {
    return pathname === '/school-settings' || pathname.startsWith('/school-settings/')
  }
  if (itemPath === '/schools') {
    return pathname.startsWith('/schools') && !/^\/schools\/[^/]+\/profile/.test(pathname)
  }
  if (itemPath === '/academics') {
    return pathname === '/academics' || pathname.startsWith('/academics/')
  }
  if (itemPath === '/school-users') {
    return pathname === '/school-users' || pathname.startsWith('/school-users/')
  }
  if (itemPath === '/admissions') {
    return pathname === '/admissions' || pathname.startsWith('/admissions/')
  }
  if (itemPath === '/students') {
    return pathname === '/students' || pathname.startsWith('/students/')
  }
  if (itemPath === '/teachers') {
    return pathname === '/teachers' || pathname.startsWith('/teachers/')
  }
  if (itemPath === '/parents') {
    return pathname === '/parents' || pathname.startsWith('/parents/')
  }
  if (itemPath === '/staff') {
    return pathname === '/staff' || pathname.startsWith('/staff/')
  }
  if (itemPath === '/school-masters') {
    return pathname === '/school-masters' || pathname.startsWith('/school-masters/')
  }
  if (itemPath === '/communications') {
    return pathname === '/communications' || pathname.startsWith('/communications/')
  }
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const location = useLocation()
  const { isSuperAdmin, isOrgAdmin, isSchoolAdmin } = useAuth()
  const navItems = resolveNav({ isSuperAdmin, isOrgAdmin, isSchoolAdmin })

  const content = (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-border bg-white transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm">
              EN
            </div>
            <span className="font-bold text-text truncate">{APP_NAME}</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-text transition"
        >
          <FiChevronLeft className={cn('h-5 w-5 transition', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {navItems.map((group, gi) => (
          <div key={gi} className="mb-4">
            {group.children ? (
              <>
                {!collapsed && (
                  <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    {group.label}
                  </p>
                )}
                {group.children.map((item) => {
                  const Icon = item.icon || iconMap[item.path?.slice(1)] || FiGrid
                  const active = isNavItemActive(location.pathname, item.path)
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onMobileClose}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition mb-0.5',
                        active
                          ? 'gradient-primary text-white shadow-md shadow-primary/20'
                          : 'text-muted hover:bg-slate-100 hover:text-text',
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  )
                })}
              </>
            ) : (
              <NavLink
                to={group.path}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'gradient-primary text-white shadow-md shadow-primary/20'
                      : 'text-muted hover:bg-slate-100 hover:text-text',
                  )
                }
              >
                <group.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{group.label}</span>}
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )

  return (
    <>
      <div className="hidden lg:block h-full shrink-0">{content}</div>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 lg:hidden"
        >
          <div className="absolute inset-0 bg-slate-900/40" onClick={onMobileClose} />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            className="absolute left-0 top-0 h-full w-64"
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
