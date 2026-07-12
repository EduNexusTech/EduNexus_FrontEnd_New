import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import BrandLogo from '../ui/BrandLogo'

const LmsIllustration = lazy(() => import('./LmsIllustration'))

function IllustrationFallback() {
  return <div className="h-48 w-full max-w-xl rounded-3xl bg-white/30" aria-hidden />
}

export default function SignInHero() {
  return (
    <div className="auth-login-hero-content flex flex-col gap-6">
      <Link to="/" className="inline-flex shrink-0">
        <BrandLogo variant="full" size="sm" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="shrink-0"
      >
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--clay-primary)] xl:text-4xl">
          Empowering Smarter Learning
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--clay-primary-soft)] xl:text-base">
          Access your courses, assignments, attendance, exams, reports and more from one secure
          platform.
        </p>
      </motion.div>
      <Suspense fallback={<IllustrationFallback />}>
        <LmsIllustration />
      </Suspense>
      <div className="auth-login-hero-illustration min-h-0 shrink overflow-hidden">
        <Suspense fallback={<IllustrationFallback />}>
          <LmsIllustration />
        </Suspense>
      </div>
    </div>
  )
}
