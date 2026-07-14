import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiPlay, FiShield } from 'react-icons/fi'
import { HERO_POINTS, WEBSITE } from '../content'
import AnimatedInfinityHero from './AnimatedInfinityHero'

export default function HeroSection({ isAuthenticated }) {
  return (
    <section className="landing-hero-bleed landing-mesh relative w-full pt-28 pb-20 sm:pt-36 sm:pb-28 lg:pt-40 lg:pb-32">
      <div className="pointer-events-none absolute left-0 top-20 h-[500px] w-[500px] -translate-x-1/3 rounded-full bg-[#3b82f6]/08 blur-[100px]" />
      <div className="pointer-events-none absolute right-0 top-40 h-[600px] w-[600px] translate-x-1/4 rounded-full bg-[#00c2ff]/06 blur-[120px]" />

      <div className="landing-wrap relative">
        <div className="grid w-full items-center gap-12 xl:grid-cols-2 xl:gap-12 2xl:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl xl:max-w-none"
          >
            <div className="landing-badge shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3b82f6] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2563eb]" />
              </span>
              {WEBSITE.tagline}
            </div>

            <h1 className="mt-8 text-4xl font-extrabold leading-[1.06] tracking-tight landing-text-primary sm:text-5xl lg:text-6xl xl:text-[4.25rem] 2xl:text-7xl">
              <span className="landing-gradient-text">EduNexus</span>{' '}
              for modern education
            </h1>

            <p className="mt-6 max-w-xl text-lg font-semibold leading-relaxed landing-text-muted xl:max-w-2xl xl:text-xl">
              {WEBSITE.description}
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-1">
              {HERO_POINTS.map((point, i) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <span className="landing-icon-box-filled mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-extrabold">
                    ✓
                  </span>
                  <span className="text-sm font-bold landing-text-primary sm:text-base">{point}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                to={isAuthenticated ? '/dashboard' : '/login'}
                className="landing-btn-primary inline-flex items-center justify-center gap-2 rounded-2xl px-10 py-4 text-base font-extrabold text-white"
              >
                {isAuthenticated ? 'Open Dashboard' : 'Start learning — Sign in'}
                <FiArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="landing-btn-outline inline-flex items-center justify-center gap-2 rounded-2xl px-10 py-4 text-base font-extrabold"
              >
                <FiPlay className="h-4 w-4 landing-text-accent" />
                See how it works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold landing-text-muted">
              <span className="flex items-center gap-2">
                <FiShield className="h-4 w-4 landing-text-accent" />
                Enterprise-grade security
              </span>
              <span className="hidden h-4 w-px bg-[var(--lp-border)] sm:block" />
              <span>Multi-school · Role-based · AI-powered</span>
            </div>
          </motion.div>

          <AnimatedInfinityHero />
        </div>
      </div>
    </section>
  )
}
