import { motion } from 'framer-motion'

const BLOBS = [
  { className: 'auth-animate-blob -left-24 -top-24 h-80 w-80 bg-[#3b82f6]/08' },
  { className: 'auth-animate-blob-delayed -right-20 top-1/4 h-72 w-72 bg-[#4c6fff]/06' },
  { className: 'auth-animate-blob bottom-0 left-1/3 h-96 w-96 bg-[#00c2ff]/05' },
]

const CIRCLES = [
  { top: '12%', left: '8%', size: 12, delay: 0 },
  { top: '28%', left: '72%', size: 8, delay: 1 },
  { top: '68%', left: '18%', size: 10, delay: 2 },
  { top: '55%', left: '88%', size: 14, delay: 0.5 },
  { top: '82%', left: '55%', size: 9, delay: 1.5 },
]

export default function AuthBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {BLOBS.map((blob, i) => (
        <div key={i} className={`absolute rounded-full blur-3xl ${blob.className}`} />
      ))}

      {CIRCLES.map((c, i) => (
        <div
          key={i}
          className="auth-animate-circle absolute rounded-full bg-[#dbeafe]/60 shadow-[0_0_24px_rgba(37,99,235,0.12)]"
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      <svg
        className="auth-animate-wave absolute bottom-0 left-0 w-full text-[#dbeafe]/50"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <path d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,138.7C1248,139,1344,117,1392,106.7L1440,96L1440,200L0,200Z" />
      </svg>

      <svg
        className="auth-animate-wave absolute bottom-8 left-0 w-full text-[#eff6ff]/40"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        fill="currentColor"
        style={{ animationDelay: '4s' }}
      >
        <path d="M0,64L80,74.7C160,85,320,107,480,101.3C640,96,800,64,960,58.7C1120,53,1280,75,1360,85.3L1440,96L1440,160L0,160Z" />
      </svg>
    </div>
  )
}

export function AuthBackgroundFade({ children }) {
  return (
    <motion.div
      className="auth-login-root clay-app auth-page-gradient font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <AuthBackground />
      {children}
    </motion.div>
  )
}
