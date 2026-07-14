import { motion } from 'framer-motion'

export default function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <motion.div
      className="group flex items-start gap-4 rounded-2xl border border-[var(--clay-glass-edge)] bg-white/90 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--clay-accent)] hover:shadow-lg hover:shadow-[var(--clay-shadow-glow)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--clay-glass-edge)] bg-white/85 text-2xl backdrop-blur-md transition group-hover:scale-110">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-bold text-[var(--clay-primary)]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--clay-primary-soft)]">{description}</p>
      </div>
    </motion.div>
  )
}
