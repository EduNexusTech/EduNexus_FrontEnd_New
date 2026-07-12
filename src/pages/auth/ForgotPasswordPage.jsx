import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import AuthLayout from '@/components/auth/layout/AuthLayout'
import AuthCard from '@/components/auth/ui/AuthCard'
import AuthButton from '@/components/auth/ui/AuthButton'
import { AuthInput } from '@/components/auth/ui/AuthInput'
import BrandLogo from '@/components/auth/ui/BrandLogo'
import { FiMail } from 'react-icons/fi'
import '@/components/auth/auth.css'

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async () => {
    toast.success('If an account exists, reset instructions have been sent.')
  }

  return (
    <AuthLayout>
      <AuthCard>
        <div className="mb-5 text-center">
          <BrandLogo variant="full" size="md" className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--clay-primary)]">Forgot password</h2>
          <p className="mt-2 text-sm text-[var(--clay-primary-soft)]">
            Enter your email and we&apos;ll send reset instructions.
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput
            id="forgot-email"
            label="Email address"
            type="email"
            icon={FiMail}
            {...register('email', { required: true })}
          />
          <AuthButton type="submit" loading={isSubmitting}>
            Send reset link
          </AuthButton>
          <Link
            to="/login"
            className="block text-center text-sm font-semibold text-[var(--clay-teal)] hover:underline"
          >
            Back to login
          </Link>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
