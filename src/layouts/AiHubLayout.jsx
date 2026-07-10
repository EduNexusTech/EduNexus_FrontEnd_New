import { NavLink } from 'react-router-dom'
import { FiArrowLeft, FiCpu, FiMessageSquare, FiZap } from 'react-icons/fi'
import { cn } from '@/utils/format'

const NAV = [
  { path: '/ai-hub', label: 'Overview', icon: FiCpu, end: true },
  { path: '/ai-hub/assistant', label: 'Nexus AI', icon: FiMessageSquare },
  { path: '/ai-hub/automations', label: 'Automations', icon: FiZap },
]

export default function AiHubLayout({ title, subtitle, children, actions }) {
  return (
    <div className="w-full">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <NavLink
          to="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted hover:bg-slate-100 hover:text-text"
        >
          <FiArrowLeft className="h-4 w-4" />
          Dashboard
        </NavLink>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          Nexus AI
        </span>
      </div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">EduNexus AI Hub</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
        </div>
        {actions}
      </div>

      <div className="mb-8 flex flex-wrap gap-2 border-b border-border pb-1">
        {NAV.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition -mb-px',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-text',
                )
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
