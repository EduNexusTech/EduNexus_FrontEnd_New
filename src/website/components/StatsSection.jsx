import { motion } from 'framer-motion'
import { STATS } from '../content'

export default function StatsSection() {
  return (
    <section className="landing-band-light w-full py-14 sm:py-16">
      <div className="landing-wrap">
        <div className="grid w-full grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`relative px-4 py-2 text-center sm:px-8 lg:px-12 lg:text-left ${
                i > 0 ? 'lg:border-l lg:border-slate-200/80' : ''
              } ${i % 2 === 1 ? 'border-l border-slate-200/60 lg:border-l-0' : ''}`}
            >
              <p className="text-3xl font-extrabold landing-gradient-text sm:text-4xl lg:text-5xl">{stat.value}</p>
              <p className="mt-2 text-sm font-extrabold text-slate-900 sm:text-base">{stat.label}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
