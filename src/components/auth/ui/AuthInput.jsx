import { forwardRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { cn } from '@/utils/format'

function useFloatingField(props) {
  const [focused, setFocused] = useState(false)
  const [filled, setFilled] = useState(false)

  return {
    focused,
    filled,
    handlers: {
      onFocus: (e) => {
        setFocused(true)
        props.onFocus?.(e)
      },
      onBlur: (e) => {
        setFocused(false)
        setFilled(e.target.value.length > 0)
        props.onBlur?.(e)
      },
      onChange: (e) => {
        setFilled(e.target.value.length > 0)
        props.onChange?.(e)
      },
    },
  }
}

export const AuthInput = forwardRef(function AuthInput(
  { label, icon: Icon, error, type = 'text', className, id, ...props },
  ref,
) {
  const { focused, filled, handlers } = useFloatingField(props)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div
        className={cn(
          'auth-input-glow relative flex h-14 items-center rounded-2xl border bg-[#F8FAFC] shadow-sm transition-all duration-200',
          error
            ? 'border-red-400 bg-red-50/30'
            : focused
              ? 'border-[#2563EB] bg-white'
              : 'border-[#E5E7EB] hover:border-blue-200 hover:bg-white',
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              'pointer-events-none absolute left-4 h-5 w-5 transition-colors duration-200',
              focused ? 'text-[#2563EB]' : 'text-[#9CA3AF]',
            )}
            aria-hidden
          />
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder=" "
          className="peer h-full w-full rounded-2xl bg-transparent pl-12 pr-4 pt-4 text-base font-normal text-[#111827] outline-none"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
          {...handlers}
        />
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-12 transition-all duration-200',
            focused || filled
              ? 'top-2 text-[11px] font-semibold uppercase tracking-wide text-[#2563EB]'
              : 'top-1/2 -translate-y-1/2 text-sm font-normal text-[#6B7280]',
          )}
        >
          {label}
        </label>
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            className="pl-1 text-xs font-medium text-red-500"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})

export const AuthPasswordInput = forwardRef(function AuthPasswordInput(
  { label, icon: Icon, error, className, id, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false)
  const { focused, filled, handlers } = useFloatingField(props)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div
        className={cn(
          'auth-input-glow relative flex h-14 items-center rounded-2xl border bg-[#F8FAFC] shadow-sm transition-all duration-200',
          error
            ? 'border-red-400 bg-red-50/30'
            : focused
              ? 'border-[#2563EB] bg-white'
              : 'border-[#E5E7EB] hover:border-blue-200 hover:bg-white',
        )}
      >
        {Icon && (
          <Icon
            className={cn(
              'pointer-events-none absolute left-4 h-5 w-5 transition-colors duration-200',
              focused ? 'text-[#2563EB]' : 'text-[#9CA3AF]',
            )}
            aria-hidden
          />
        )}
        <input
          ref={ref}
          id={id}
          type={visible ? 'text' : 'password'}
          placeholder=" "
          className="h-full w-full rounded-2xl bg-transparent pl-12 pr-14 pt-4 text-base font-normal text-[#111827] outline-none"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
          {...handlers}
        />
        <label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-12 transition-all duration-200',
            focused || filled
              ? 'top-2 text-[11px] font-semibold uppercase tracking-wide text-[#2563EB]'
              : 'top-1/2 -translate-y-1/2 text-sm font-normal text-[#6B7280]',
          )}
        >
          {label}
        </label>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 flex h-10 w-10 items-center justify-center rounded-xl text-[#9CA3AF] transition hover:bg-blue-50 hover:text-[#2563EB]"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            className="pl-1 text-xs font-medium text-red-500"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
})
