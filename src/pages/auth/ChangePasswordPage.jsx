import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiLock, FiShield } from 'react-icons/fi'
import { authService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ChangePasswordPage() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()

  const mutation = useMutation({
    mutationFn: (data) =>
      authService.changePassword({
        old_password: data.oldPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      }),
    onSuccess: () => {
      toast.success('Password changed successfully')
      reset()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'Change Password' }]} />
      <PageHeader title="Change Password" subtitle="Update your account password" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Current Password"
              type="password"
              error={errors.oldPassword?.message}
              {...register('oldPassword', { required: 'Required' })}
            />
            <Input
              label="New Password"
              type="password"
              error={errors.newPassword?.message}
              {...register('newPassword', {
                required: 'Required',
                minLength: { value: 8, message: 'Min 8 characters' },
              })}
            />
            <div className="sm:col-span-2">
              <Input
                label="Confirm Password"
                type="password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Required',
                  validate: (v) => v === watch('newPassword') || 'Passwords do not match',
                })}
              />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2 border-t border-border">
              <Button type="submit" loading={mutation.isPending}>Update Password</Button>
              <Button type="button" variant="secondary" onClick={() => reset()}>Reset</Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit border-dashed bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <FiShield className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-text">Password tips</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted">
            <li className="flex gap-2"><FiLock className="h-4 w-4 shrink-0 mt-0.5" /> Use at least 8 characters</li>
            <li className="flex gap-2"><FiLock className="h-4 w-4 shrink-0 mt-0.5" /> Mix letters, numbers, and symbols</li>
            <li className="flex gap-2"><FiLock className="h-4 w-4 shrink-0 mt-0.5" /> Avoid reusing old passwords</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
