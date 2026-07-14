import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiKey } from 'react-icons/fi'
import { ResourceDetailPage } from '@/components/crud/ResourceFormPage'
import UserPasswordModal from '@/components/users/UserPasswordModal'
import { userService } from '@/api/services'
import Button from '@/components/ui/Button'
import { getErrorMessage } from '@/api/client'
import { ROLE_TYPES } from '@/config/constants'
import { StatusBadge } from '@/components/ui/Feedback'
import { confirmDialog } from '@/utils/confirm'

const ROLE_LABELS = Object.fromEntries(ROLE_TYPES.map((role) => [role.value, role.label]))

export default function UserDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [passwordOpen, setPasswordOpen] = useState(false)

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
    <>
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
          {
            key: 'role_type',
            label: 'Role Type',
            render: (item) => ROLE_LABELS[item.role_type] || item.role_type || 'User',
          },
          {
            key: 'is_school_admin',
            label: 'School Admin',
            render: (item) => (item.is_school_admin || item.role_type === 'school_admin' ? 'Yes' : 'No'),
          },
          { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
        ]}
        actions={(item) => (
          <>
            <Button variant="view" onClick={() => setPasswordOpen(true)}>
              <FiKey className="h-4 w-4" /> View Password
            </Button>
            <Link to={`/users/${id}/edit`}><Button variant="edit">Edit</Button></Link>
            <Button variant="secondary" onClick={handleResetPassword} loading={resetPasswordMutation.isPending}>Reset Password</Button>
            {item.is_active ? (
              <Button variant="danger" onClick={() => deactivateMutation.mutate()} loading={deactivateMutation.isPending}>Deactivate</Button>
            ) : (
              <Button variant="success" onClick={() => activateMutation.mutate()} loading={activateMutation.isPending}>Activate</Button>
            )}
          </>
        )}
      />

      <UserPasswordModal
        userId={id}
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </>
  )
}
