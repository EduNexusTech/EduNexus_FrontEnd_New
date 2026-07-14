import { Link, useLocation } from 'react-router-dom'
import { FiChevronRight, FiHome } from 'react-icons/fi'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="clay-breadcrumb clay-app mb-5 flex items-center gap-1 text-sm">
      <Link to="/dashboard" className="clay-icon-3d flex h-8 w-8 items-center justify-center transition hover:scale-105">
        <FiHome className="h-4 w-4 text-[var(--clay-primary)]" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <FiChevronRight className="h-3 w-3 text-[var(--clay-primary-soft)]" />
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="font-semibold text-[var(--clay-primary-soft)] transition hover:text-[var(--clay-text-sharp)]">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? 'clay-breadcrumb-current font-bold text-[var(--clay-text-sharp)]' : 'font-semibold text-[var(--clay-primary-soft)]'}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}

export function useBreadcrumbFromPath(pathMap) {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  return segments.map((seg, i) => ({
    label: pathMap[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    href: i < segments.length - 1 ? '/' + segments.slice(0, i + 1).join('/') : undefined,
  }))
}
