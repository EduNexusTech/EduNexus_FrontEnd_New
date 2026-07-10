import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiMenu, FiX } from 'react-icons/fi'
import { WEBSITE } from '../content'

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#audiences', label: 'For everyone' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#modules', label: 'Modules' },
]

export default function WebsiteHeader({ isAuthenticated }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full">
      <div className={`landing-wrap transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
        <div
          className={`flex h-14 w-full items-center justify-between rounded-2xl px-4 transition-all duration-300 sm:h-16 sm:px-6 lg:px-8 ${
            scrolled ? 'landing-glass shadow-xl' : 'bg-white/40 backdrop-blur-md'
          }`}
        >
          <Link to="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg shadow-indigo-500/20 sm:h-11 sm:w-11">
              <img src="/edunexus-infinity-logo.png" alt="" className="h-full w-full object-cover object-top scale-150" />
            </div>
            <div>
              <span className="block text-lg font-extrabold tracking-tight text-slate-900">{WEBSITE.name}</span>
              <span className="hidden text-[10px] font-bold uppercase tracking-wider text-indigo-600 sm:block">Learning Platform</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-white/70 hover:text-slate-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="landing-btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-extrabold text-white"
            >
              {isAuthenticated ? 'LMS Dashboard' : 'Sign in'}
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl p-2.5 text-slate-700 lg:hidden"
            aria-label="Menu"
          >
            {mobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="landing-glass mt-2 w-full rounded-2xl p-4 lg:hidden"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700"
              >
                {item.label}
              </a>
            ))}
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="landing-btn-primary mt-3 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-extrabold text-white"
            >
              {isAuthenticated ? 'LMS Dashboard' : 'Sign in'}
            </Link>
          </motion.div>
        )}
      </div>
    </header>
  )
}
