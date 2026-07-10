import { motion } from 'framer-motion'

export default function AuthCard({ children, className = '' }) {
  return (
    <motion.div
      className={`w-full max-w-[520px] rounded-[28px] border border-[#E5E7EB] bg-white/95 p-8 backdrop-blur-xl auth-card-shadow sm:p-10 ${className}`}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
