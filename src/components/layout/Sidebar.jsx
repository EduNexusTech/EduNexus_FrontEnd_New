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
  FiLayers,
  FiBook,
  FiClipboard,
  FiUserCheck,
  FiMail,
  FiCpu,
  FiMessageSquare,
  FiZap,
} from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/Feedback'
import { cn } from '@/utils/format'
import '@/styles/dashboard-clay.css'

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

function NavItem({ item, onMobileClose, active }) {
  const Icon = item.icon || iconMap[item.path?.slice(1)] || FiGrid

  return (
    <NavLink
      to={item.path}
      onClick={onMobileClose}
      className={cn(
        'clay-nav-item mb-1 flex items-center gap-3 px-4 py-2.5 text-[14px]',
        active && 'active',
      )}
    >
      <Icon className="h-[20px] w-[20px] shrink-0" strokeWidth={1.85} />
      <span className="truncate">{item.label}</span>
    </NavLink>
  )
}

function SidebarProfile() {
  const { user } = useAuth()
  const displayName =
    user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'User'
  const firstName = displayName.split(' ')[0]

  return (
    <div className="clay-sidebar-profile flex items-center gap-3 px-5 py-5">
      <div className="clay-sidebar-avatar-ring shrink-0 rounded-full">
        <Avatar name={displayName} src={user?.profile_image} size="md" />
      </div>
      <p className="clay-sidebar-profile-name min-w-0 flex-1 truncate text-sm">
        Hi, {firstName}! <span aria-hidden>👋</span>
      </p>
    </div>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const location = useLocation()
  const { isSuperAdmin, isOrgAdmin, isSchoolAdmin } = useAuth()
  const navItems = resolveNav({ isSuperAdmin, isOrgAdmin, isSchoolAdmin })

  const content = (
    <aside className="clay-app clay-sidebar flex h-full w-[260px] flex-col">
      <SidebarProfile />

      <nav className="clay-sidebar-nav flex-1 overflow-y-auto px-3 pb-4">
        {navItems.map((group, gi) => (
          <div key={gi}>
            {gi > 0 ? <div className="clay-sidebar-divider" /> : null}
            {group.children ? (
              group.children.map((item) => (
                <NavItem
                  key={item.path}
                  item={item}
                  onMobileClose={onMobileClose}
                  active={isNavItemActive(location.pathname, item.path)}
                />
              ))
            ) : (
              <NavItem
                item={group}
                onMobileClose={onMobileClose}
                active={isNavItemActive(location.pathname, group.path)}
              />
            )}
          </div>
        ))}
      </nav>
    </aside>
  )

  return (
    <>
      <div className="hidden h-full shrink-0 lg:block">{content}</div>
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
            className="absolute left-3 top-3 h-[calc(100%-1.5rem)] w-[260px]"
          >
            {content}
          </motion.div>
        </motion.div>
      )}
    </>
  )
}
