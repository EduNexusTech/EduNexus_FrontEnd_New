import { Link } from 'react-router-dom'
import { cn } from '@/utils/format'

const variants = {
  add: 'lms-icon-btn-add',
  create: 'lms-icon-btn-create',
  edit: 'lms-icon-btn-edit',
  delete: 'lms-icon-btn-delete',
  view: 'lms-icon-btn-view',
  pdf: 'lms-icon-btn-pdf',
  excel: 'lms-icon-btn-excel',
  refresh: 'lms-icon-btn-refresh',
  search: 'lms-icon-btn-search',
  filter: 'lms-icon-btn-filter',
  success: 'lms-icon-btn-success',
}

export default function IconActionButton({
  variant = 'view',
  children,
  className,
  href,
  onClick,
  title,
  disabled,
  type = 'button',
}) {
  const classes = cn('lms-icon-btn', variants[variant] || variants.view, className)

  if (href) {
    return (
      <Link to={href} className={classes} title={title} aria-label={title}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      title={title}
      aria-label={title}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
