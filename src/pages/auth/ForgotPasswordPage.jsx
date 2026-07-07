import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  const onSubmit = async () => {
    toast.success('If an account exists, reset instructions have been sent.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md rounded-2xl bg-white border border-border card-shadow p-8">
        <h2 className="text-2xl font-bold text-text">Forgot password</h2>
        <p className="mt-2 text-muted text-sm">Enter your email and we'll send reset instructions.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input label="Email" type="email" required {...register('email', { required: true })} />
          <Button type="submit" loading={isSubmitting} className="w-full">Send reset link</Button>
          <Link to="/login" className="block text-center text-sm text-primary hover:underline">Back to login</Link>
        </form>
      </div>
    </div>
  )
}
