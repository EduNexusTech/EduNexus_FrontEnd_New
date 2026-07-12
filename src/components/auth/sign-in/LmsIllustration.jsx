import { motion } from 'framer-motion'

const CHART_BARS = ['auth-chart-bar--1', 'auth-chart-bar--2', 'auth-chart-bar--3', 'auth-chart-bar--4', 'auth-chart-bar--5', 'auth-chart-bar--6']

export default function LmsIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-xl max-h-[220px] scale-[0.88] origin-top" aria-hidden>
      <motion.div
        className="clay-card clay-card-3d relative z-10 rounded-3xl border border-[var(--clay-glass-border)] bg-white/95 p-6 shadow-2xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#52b788] to-[#40916c]" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-28 rounded-full bg-[var(--clay-border)]" />
            <div className="h-2 w-20 rounded-full bg-[var(--clay-mint-light)]" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['Courses', 'Students', 'Grades'].map((label, i) => (
            <div key={label} className="rounded-2xl bg-[var(--clay-mint-light)] p-3">
              <div className="mb-2 h-2 w-12 rounded-full bg-[#95d5b2]" />
              <div className="text-lg font-bold text-[var(--clay-teal)]">{['24', '1.2k', '98%'][i]}</div>
              <div className="text-[10px] font-medium text-[var(--clay-primary-soft)]">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--clay-primary)]">
            <span>Course Progress</span>
            <span className="text-[var(--clay-teal)]">78%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--clay-border)]">
            <motion.div
              className="auth-progress-fill h-full rounded-full bg-gradient-to-r from-[#52b788] to-[#40916c]"
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>
      <motion.div
        className="auth-animate-icon-float auth-float-delay-1 absolute -right-2 top-16 z-20 rounded-2xl border border-[var(--clay-border)] bg-white px-4 py-3 shadow-xl"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.65 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🎓</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--clay-teal)]">Certificate</p>
            <p className="text-xs font-semibold text-[var(--clay-primary)]">Earned!</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="auth-animate-icon-float auth-float-delay-2 absolute -bottom-4 -right-2 z-20 rounded-2xl border border-[var(--clay-border)] bg-white p-4 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--clay-primary-soft)]">Analytics</p>
        <div className="flex h-12 items-end gap-1.5">
          {CHART_BARS.map((barClass) => (
            <div key={barClass} className={`auth-chart-bar ${barClass}`} />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-8 left-8 z-0 flex items-center gap-3 rounded-2xl border border-[var(--clay-border)] bg-[var(--clay-mint-light)]/90 px-4 py-3 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-3xl">💻</span>
        <div>
          <p className="text-xs font-bold text-[var(--clay-primary)]">Live Classes</p>
          <p className="text-[10px] text-[var(--clay-primary-soft)]">Teacher presenting now</p>
        </div>
      </motion.div>

      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-[#52b788]/20 via-[#74c69d]/10 to-[#40916c]/20 blur-3xl" />
    </div>
  )
}
