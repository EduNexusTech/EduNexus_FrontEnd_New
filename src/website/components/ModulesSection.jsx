import { motion } from 'framer-motion'
import { MODULES } from '../content'

const HIGHLIGHTS = [
  {
    title: 'Course-first navigation',
    desc: 'Learners land on enrolled courses; educators jump straight to authoring and grading.',
    icon: '📚',
  },
  {
    title: 'Live + async learning',
    desc: 'Blend recorded lessons, live virtual classes, and self-paced modules seamlessly.',
    icon: '🎥',
  },
  {
    title: 'AI study companion',
    desc: 'Nexus AI tutors learners, assists educators, and automates admin workflows.',
    icon: '✨',
  },
]

export default function ModulesSection() {
  return (
    <section id="modules" className="relative w-full py-24 sm:py-32">
      <div className="landing-wrap">
        <div className="grid w-full items-start gap-16 xl:grid-cols-2 xl:gap-20">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-violet-600">
              Complete module suite
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl xl:text-6xl">
              LMS + admin —{' '}
              <span className="landing-gradient-text">beautifully unified</span>
            </h2>
            <p className="mt-5 max-w-xl text-lg font-semibold text-slate-600">
              Every module follows EduNexus patterns: search, export, smart forms, and role-aware access.
            </p>

            <div className="mt-10 space-y-4">
              {HIGHLIGHTS.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex w-full gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-xl">
                    {item.icon}
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 lg:text-base">{item.title}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="landing-glass w-full rounded-3xl p-8 lg:p-10"
          >
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">All LMS & admin modules</p>
            <div className="mt-6 flex w-full flex-wrap gap-2.5">
              {MODULES.map((name, i) => (
                <motion.span
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                  className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  {name}
                </motion.span>
              ))}
            </div>

            <div className="mt-8 w-full rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 lg:p-8">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Institutional backbone</p>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-300 lg:text-base">
                Multi-tenant <strong className="text-white">organizations & schools</strong>, granular{' '}
                <strong className="text-white">roles & permissions</strong>, master data, audit logs, and{' '}
                <strong className="text-white">EduNexus Post</strong> — the ERP layer your LMS runs on.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
