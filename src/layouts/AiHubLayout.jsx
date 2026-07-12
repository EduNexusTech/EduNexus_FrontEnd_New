import { NavLink } from 'react-router-dom'
import { FiArrowLeft, FiCpu, FiMessageSquare, FiZap } from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { cn } from '@/utils/format'

const NAV = [
  { path: '/ai-hub', label: 'Overview', icon: FiCpu, end: true },
  { path: '/ai-hub/assistant', label: 'Nexus AI', icon: FiMessageSquare },
  { path: '/ai-hub/automations', label: 'Automations', icon: FiZap },
]

export default function AiHubLayout({ title, subtitle, children, actions }) {
  return (
    <div className="lms-page w-full">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'AI Hub' }, { label: title }]} />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <NavLink to="/dashboard" className="lms-back-pill">
          <FiArrowLeft className="h-4 w-4" />
          Dashboard
        </NavLink>
        <span className="lms-badge-pill">Nexus AI</span>
      </div>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--clay-teal)]">EduNexus AI Hub</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[var(--clay-primary)]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-[var(--clay-primary-soft)]">{subtitle}</p>}
        </div>
        {actions}
      </div>

      <div className="lms-tab-nav mb-8 flex flex-wrap gap-2 pb-1">
        {NAV.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn('lms-tab-nav-item', isActive && 'lms-tab-nav-item--active')
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </div>

      {children}
    </div>
  )
}
