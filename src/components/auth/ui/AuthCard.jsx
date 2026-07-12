import { motion } from 'framer-motion'

export default function AuthCard({ children, className = '' }) {
  return (
    <motion.div
      className={`auth-login-card clay-card clay-card-white clay-card-3d w-full max-w-[520px] rounded-[28px] border border-[var(--clay-glass-border)] bg-white/90 p-6 backdrop-blur-xl auth-card-shadow sm:p-7 ${className}`}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
