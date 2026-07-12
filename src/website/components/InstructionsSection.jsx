import { motion } from 'framer-motion'
import { SAMPLE_COURSES, STEPS, ROLE_GUIDE, TESTIMONIALS } from '../content'

export default function InstructionsSection() {
  return (
    <section id="how-it-works" className="relative w-full py-24 sm:py-32">
      <div className="absolute inset-0 landing-mesh opacity-50" />
      <div className="landing-wrap relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl"
        >
          <span className="landing-tag">Launch in days, not months</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight landing-text-primary sm:text-4xl lg:text-5xl xl:text-6xl">
            Go live with your LMS in{' '}
            <span className="landing-gradient-text">four steps</span>
          </h2>
        </motion.div>

        <div className="mt-20 grid w-full gap-16 xl:grid-cols-2 xl:gap-20">
          <div className="relative">
            <div className="landing-timeline-line absolute bottom-4 left-[23px] top-4 w-0.5 rounded-full opacity-40" />
            <div className="space-y-8">
              {STEPS.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative flex gap-6"
                >
                  <div className="landing-icon-box-filled relative z-10 flex h-12 w-12 shrink-0 items-center justify-center text-sm font-extrabold">
                    {item.step}
                  </div>
                  <div className="landing-card flex-1 p-6 lg:p-8">
                    <h3 className="text-lg font-extrabold landing-text-primary lg:text-xl">{item.title}</h3>
                    <p className="mt-2 text-sm font-semibold leading-relaxed landing-text-muted lg:text-base">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="landing-glass w-full rounded-3xl p-8"
            >
              <h3 className="text-xl font-extrabold landing-text-primary">Role-based LMS access</h3>
              <p className="mt-2 text-sm font-semibold landing-text-muted">
                Learners, educators, and admins each get a tailored experience — secure and scoped.
              </p>
              <div className="mt-6 space-y-3">
                {ROLE_GUIDE.map((item) => (
                  <div
                    key={item.role}
                    className="overflow-hidden rounded-2xl border border-[var(--lp-border)] bg-white/80 backdrop-blur-sm"
                  >
                    <div className={`bg-gradient-to-r ${item.color} px-5 py-3`}>
                      <p className="text-sm font-extrabold text-white">{item.role}</p>
                    </div>
                    <p className="px-5 py-4 text-sm font-semibold landing-text-muted">{item.access}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="landing-glass w-full rounded-3xl p-8"
            >
              <p className="text-xs font-extrabold uppercase tracking-wider landing-text-muted">Sample course progress</p>
              <div className="mt-5 space-y-4">
                {SAMPLE_COURSES.map((course) => (
                  <div key={course.title}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-extrabold landing-text-primary">{course.title}</p>
                      <p className="text-xs font-bold landing-text-accent">{course.progress}%</p>
                    </div>
                    <div className="landing-progress-bar mt-2">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${course.color}`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] font-semibold landing-text-muted">{course.students} learners</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {TESTIMONIALS.map((t, i) => (
                <motion.blockquote
                  key={t.author}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="landing-card p-6"
                >
                  <p className="text-sm font-semibold italic leading-relaxed landing-text-primary">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <footer className="mt-4 flex items-center gap-3">
                    <div className="landing-icon-box-filled flex h-10 w-10 items-center justify-center text-xs font-extrabold">
                      {t.author[0]}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold landing-text-primary">{t.author}</p>
                      <p className="text-xs font-semibold landing-text-muted">{t.role}</p>
                    </div>
                  </footer>
                </motion.blockquote>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
