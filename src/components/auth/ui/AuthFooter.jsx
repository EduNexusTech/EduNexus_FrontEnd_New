import { Link } from 'react-router-dom'

const LINKS = [
  { label: 'Need Help?', href: '/' },
  { label: 'Privacy Policy', href: '/' },
  { label: 'Terms', href: '/' },
  { label: 'Support', href: '/' },
]

export default function AuthFooter() {
  return (
    <footer className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-[var(--clay-border)] pt-4">
      {LINKS.map((link) => (
        <Link
          key={link.label}
          to={link.href}
          className="text-xs font-medium text-[var(--clay-primary-soft)] transition hover:text-[var(--clay-teal)] hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </footer>
  )
}
