import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { getErrorMessage } from '@/api/client'
import AuthLayout from '@/components/auth/layout/AuthLayout'
import SignInHero from '@/components/auth/sign-in/SignInHero'
import SignInCard from '@/components/auth/sign-in/SignInCard'
import '@/components/auth/auth.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
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
    <AuthLayout hero={<SignInHero />}>
      <SignInCard
        register={register}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        errors={errors}
        isSubmitting={isSubmitting}
      />
    </AuthLayout>
  )
}
