import { motion } from 'framer-motion'

export default function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <motion.div
      className="group flex items-start gap-4 rounded-2xl border border-[#E5E7EB] bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-2xl shadow-inner transition group-hover:scale-110">
        {icon}
      </span>
      <div>
        <h3 className="text-sm font-bold text-[#111827]">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{description}</p>
      </div>
    </motion.div>
  )
}
