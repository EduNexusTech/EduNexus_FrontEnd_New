import { motion } from 'framer-motion'
import { FiBookOpen, FiShield, FiUsers } from 'react-icons/fi'
import { AUDIENCES } from '../content'

const ICONS = {
  learner: FiBookOpen,
  educator: FiUsers,
  admin: FiShield,
}

export default function AudienceSection() {
  return (
    <section id="audiences" className="landing-band-dark w-full py-24 sm:py-32">
      <div className="landing-wrap">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <span className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-400">
            Built for every role
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl">
            One LMS.{' '}
            <span className="landing-gradient-text-light">Learners, educators & admins.</span>
          </h2>
          <p className="mt-5 text-lg font-semibold text-slate-400">
            Tailored experiences for how each person interacts with your institution.
          </p>
        </motion.div>

        <div className="mt-16 grid w-full gap-6 md:grid-cols-3 lg:gap-8">
          {AUDIENCES.map((item, i) => {
            const Icon = ICONS[item.icon] || FiUsers
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/8"
              >
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${item.gradient} p-4 text-white shadow-xl`}>
                  <Icon className="h-7 w-7" />
                </div>
                <p className="mt-6 text-xs font-extrabold uppercase tracking-wider text-slate-400">{item.subtitle}</p>
                <h3 className="mt-2 text-2xl font-extrabold text-white">{item.title}</h3>
                <p className="mt-4 text-sm font-semibold leading-relaxed text-slate-400">{item.description}</p>
                <div className={`pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${item.gradient} opacity-10 blur-2xl transition group-hover:opacity-20`} />
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
