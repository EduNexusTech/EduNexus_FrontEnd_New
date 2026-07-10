import { Link } from 'react-router-dom'

const LINKS = [
  { label: 'Need Help?', href: '/' },
  { label: 'Privacy Policy', href: '/' },
  { label: 'Terms', href: '/' },
  { label: 'Support', href: '/' },
]

export default function AuthFooter() {
  return (
    <footer className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[#E5E7EB] pt-6">
      {LINKS.map((link) => (
        <Link
          key={link.label}
          to={link.href}
          className="text-xs font-medium text-[#6B7280] transition hover:text-[#2563EB] hover:underline"
        >
          {link.label}
        </Link>
      ))}
    </footer>
  )
}
