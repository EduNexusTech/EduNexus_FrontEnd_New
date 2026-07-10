import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiStar } from 'react-icons/fi'

export default function CtaSection({ isAuthenticated }) {
  return (
    <section className="w-full py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="landing-band-dark relative w-full overflow-hidden px-6 py-20 text-center sm:px-12 sm:py-28 lg:px-16"
      >
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-4xl">
          <div className="mx-auto flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/5 px-5 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <FiStar key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
            <span className="ml-2 text-xs font-bold text-white/85">Trusted by forward-thinking institutions</span>
          </div>

          <h2 className="mx-auto mt-8 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            Ready to deliver an extraordinary learning experience with EduNexus?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base font-semibold text-slate-400 lg:text-lg">
            Sign in to explore the full LMS — courses, live classes, assessments, progress tracking, AI tutor, and institutional admin.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to={isAuthenticated ? '/dashboard' : '/login'}
              className="landing-btn-primary inline-flex items-center gap-2 rounded-2xl px-12 py-4 text-base font-extrabold text-white"
            >
              {isAuthenticated ? 'Open LMS Dashboard' : 'Sign in to EduNexus LMS'}
              <FiArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/15 px-10 py-4 text-base font-extrabold text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Explore features
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
