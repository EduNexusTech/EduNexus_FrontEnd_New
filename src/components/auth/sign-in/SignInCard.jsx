import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock } from 'react-icons/fi'
import AuthCard from '../ui/AuthCard'
import { AuthInput, AuthPasswordInput } from '../ui/AuthInput'
import AuthButton from '../ui/AuthButton'
import AuthFooter from '../ui/AuthFooter'
import BrandLogo from '../ui/BrandLogo'
const fieldVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.08, duration: 0.4 },
  }),
}

export default function SignInCard({
  register,
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting,
}) {
  return (
    <AuthCard>
      <header className="auth-login-card-header mb-5 text-center">
        <motion.div
          className="auth-login-logo mx-auto mb-4 flex justify-center"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <BrandLogo variant="full" size="md" />
        </motion.div>
        <motion.h2
          className="text-2xl font-bold text-[var(--clay-primary)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Welcome Back
        </motion.h2>
        <motion.p
          className="mt-2 text-sm text-[var(--clay-primary-soft)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Sign in to your LMS Account
        </motion.p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
          <AuthInput
            id="signin-email"
            label="Email address"
            type="email"
            icon={FiMail}
            autoComplete="email"
            inputMode="email"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
        </motion.div>

        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
          <AuthPasswordInput
            id="signin-password"
            label="Password"
            icon={FiLock}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
        </motion.div>

        <motion.div
          className="flex items-center justify-between gap-3"
          custom={2}
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
        >
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[var(--clay-primary-soft)] transition hover:text-[var(--clay-teal)]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[var(--clay-border)] text-[var(--clay-teal)] focus:ring-[var(--clay-accent)]/20"
              {...register('rememberMe')}
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-[var(--clay-teal)] transition hover:text-[var(--clay-sidebar-deep)] hover:underline"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
          <AuthButton type="submit" loading={isSubmitting} className="!h-12">
            Sign in
          </AuthButton>
        </motion.div>
      </form>

      <AuthFooter />
    </AuthCard>
  )
}
