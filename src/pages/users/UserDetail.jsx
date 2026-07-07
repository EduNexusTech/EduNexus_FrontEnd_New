import { Link, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ResourceDetailPage } from '@/components/crud/ResourceFormPage'
import { userService } from '@/api/services'
import Button from '@/components/ui/Button'
import { getErrorMessage } from '@/api/client'
import { StatusBadge } from '@/components/ui/Feedback'
import { confirmDialog } from '@/utils/confirm'

export default function UserDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const activateMutation = useMutation({
    mutationFn: () => userService.activate(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User activated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => userService.deactivate(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); toast.success('User deactivated') },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: (password) => userService.resetPassword(id, password),
    onSuccess: () => toast.success('Password reset successfully'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const handleResetPassword = async () => {
    const confirmed = await confirmDialog({
      title: 'Reset Password',
      input: 'text',
      inputPlaceholder: 'Enter new password',
      inputAttributes: { minlength: 8 },
    })
    if (confirmed && confirmed.value) {
      resetPasswordMutation.mutate(confirmed.value)
    }
  }

  return (
    <ResourceDetailPage
      title="User"
      queryKey="users"
      getFn={userService.get}
      basePath="/users"
      fields={[
        { key: 'first_name', label: 'First Name' },
        { key: 'last_name', label: 'Last Name' },
        { key: 'email', label: 'Email' },
        { key: 'mobile_number', label: 'Mobile' },
        { key: 'organization_name', label: 'Organization' },
        { key: 'school_name', label: 'School' },
        { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
      ]}
      actions={(item) => (
        <>
          <Link to={`/users/${id}/edit`}><Button variant="secondary">Edit</Button></Link>
          <Button variant="outline" onClick={handleResetPassword} loading={resetPasswordMutation.isPending}>Reset Password</Button>
          {item.is_active ? (
            <Button variant="danger" onClick={() => deactivateMutation.mutate()} loading={deactivateMutation.isPending}>Deactivate</Button>
          ) : (
            <Button onClick={() => activateMutation.mutate()} loading={activateMutation.isPending}>Activate</Button>
          )}
        </>
      )}
    />
  )
}
