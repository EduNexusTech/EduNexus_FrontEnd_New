import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import FeatureCard from '../ui/FeatureCard'
import BrandLogo from '../ui/BrandLogo'

const LmsIllustration = lazy(() => import('./LmsIllustration'))

const FEATURES = [
  {
    icon: '📚',
    title: 'Digital Learning',
    description: 'Access courses, modules, and multimedia content anytime, anywhere.',
  },
  {
    icon: '🎓',
    title: 'Student Success',
    description: 'Track progress, assignments, and achievements in one place.',
  },
  {
    icon: '📈',
    title: 'Academic Analytics',
    description: 'Real-time insights into attendance, grades, and performance.',
  },
]

function IllustrationFallback() {
  return (
    <div className="mx-auto flex h-64 w-full max-w-xl items-center justify-center rounded-3xl bg-white/50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-200 border-t-[#2563EB]" />
    </div>
  )
}

export default function SignInHero() {
  return (
    <div className="flex flex-col gap-10">
      <Link to="/" className="inline-flex">
        <BrandLogo variant="full" size="sm" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#111827] xl:text-[2.75rem]">
          Empowering Smarter Learning
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-[#6B7280]">
          Access your courses, assignments, attendance, exams, reports and more from one secure platform.
        </p>
      </motion.div>

      <Suspense fallback={<IllustrationFallback />}>
        <LmsIllustration />
      </Suspense>

      <div className="grid gap-4">
        {FEATURES.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} delay={0.3 + i * 0.1} />
        ))}
      </div>
    </div>
  )
}
