import { motion } from 'framer-motion'

const CHART_BARS = ['auth-chart-bar--1', 'auth-chart-bar--2', 'auth-chart-bar--3', 'auth-chart-bar--4', 'auth-chart-bar--5', 'auth-chart-bar--6']

export default function LmsIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-hidden>
      <motion.div
        className="relative z-10 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-2xl shadow-blue-500/10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4]" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-28 rounded-full bg-[#E5E7EB]" />
            <div className="h-2 w-20 rounded-full bg-[#F3F4F6]" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {['Courses', 'Students', 'Grades'].map((label, i) => (
            <div key={label} className="rounded-2xl bg-[#F8FAFC] p-3">
              <div className="mb-2 h-2 w-12 rounded-full bg-blue-200" />
              <div className="text-lg font-bold text-[#2563EB]">{['24', '1.2k', '98%'][i]}</div>
              <div className="text-[10px] font-medium text-[#6B7280]">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#374151]">
            <span>Course Progress</span>
            <span className="text-[#2563EB]">78%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[#E5E7EB]">
            <motion.div
              className="auth-progress-fill h-full rounded-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4]"
              initial={{ width: 0 }}
              animate={{ width: '78%' }}
              transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        className="auth-animate-icon-float absolute -left-4 top-8 z-20 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xl"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <p className="text-xs font-bold text-[#111827]">Digital Learning</p>
            <p className="text-[10px] text-[#6B7280]">12 active courses</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="auth-animate-icon-float auth-float-delay-1 absolute -right-2 top-16 z-20 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 shadow-xl"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.65 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🎓</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#14B8A6]">Certificate</p>
            <p className="text-xs font-semibold text-[#111827]">Earned!</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="auth-animate-icon-float auth-float-delay-2 absolute -bottom-4 -right-4 z-20 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#6B7280]">Analytics</p>
        <div className="flex h-12 items-end gap-1.5">
          {CHART_BARS.map((barClass) => (
            <div key={barClass} className={`auth-chart-bar ${barClass}`} />
          ))}
        </div>
      </motion.div>

      <motion.div
        className="absolute -bottom-8 left-8 z-0 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="text-3xl">💻</span>
        <div>
          <p className="text-xs font-bold text-[#111827]">Live Classes</p>
          <p className="text-[10px] text-[#6B7280]">Teacher presenting now</p>
        </div>
      </motion.div>

      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-blue-400/20 via-cyan-400/10 to-teal-400/20 blur-3xl" />
    </div>
  )
}
