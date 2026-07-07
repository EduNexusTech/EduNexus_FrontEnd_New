import { Link, useLocation } from 'react-router-dom'
import { FiChevronRight, FiHome } from 'react-icons/fi'

export default function Breadcrumb({ items = [] }) {
  const location = useLocation()

  return (
    <nav className="flex items-center gap-1 text-sm text-muted mb-6">
      <Link to="/dashboard" className="flex items-center hover:text-primary transition">
        <FiHome className="h-4 w-4" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <FiChevronRight className="h-3 w-3" />
          {item.href && i < items.length - 1 ? (
            <Link to={item.href} className="hover:text-primary transition">
              {item.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? 'text-text font-medium' : ''}>{item.label}</span>
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
