import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/api/client'
import Button from '@/components/ui/Button'
import Input, { CheckboxField } from '@/components/ui/Input'
import { APP_NAME } from '@/config/constants'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '', rememberMe: false } })

  const onSubmit = async (data) => {
    try {
      await login({ email: data.email, password: data.password }, data.rememberMe)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Invalid credentials'))
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl font-bold mb-4">{APP_NAME}</h1>
            <p className="text-xl text-white/80 max-w-md">
              Enterprise School Management Platform. Manage organizations, schools, users, and more.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-text">Sign in</h2>
            <p className="mt-2 text-muted">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@school.com"
              error={errors.email?.message}
              required
              {...register('email', { required: 'Email is required' })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                required
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted hover:text-text"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <CheckboxField label="Remember me" {...register('rememberMe')} />
              <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Sign in
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
