import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/format'

export default function AuthButton({
  children,
  loading,
  disabled,
  type = 'button',
  className,
  onClick,
}) {
  const [ripples, setRipples] = useState([])

  const handleClick = useCallback(
    (e) => {
      if (loading || disabled) return

      const rect = e.currentTarget.getBoundingClientRect()
      const id = Date.now()
      setRipples((prev) => [
        ...prev,
        { id, x: e.clientX - rect.left, y: e.clientY - rect.top },
      ])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 550)

      onClick?.(e)
    },
    [loading, disabled, onClick],
  )

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={cn(
        'auth-btn-gradient relative flex h-[60px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl text-base font-semibold text-white shadow-lg transition-all duration-200',
        'hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60',
        'shadow-[0_8px_24px_rgba(64,145,108,0.28)] hover:shadow-[0_10px_28px_rgba(64,145,108,0.35)]',
        className,
      )}
      whileHover={!loading && !disabled ? { scale: 1.01 } : undefined}
      whileTap={!loading && !disabled ? { scale: 0.98 } : undefined}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="auth-ripple-effect pointer-events-none absolute rounded-full bg-white/40"
          style={{ left: r.x - 12, top: r.y - 12, width: 24, height: 24 }}
        />
      ))}
      {loading ? (
        <>
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Signing in…
        </>
      ) : (
        children
      )}
    </motion.button>
  )
}
