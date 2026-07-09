import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Feedback'
import { userService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { getUserPassword, saveUserPassword } from '@/utils/userPasswordStorage'

function getDisplayName(user) {
  if (!user) return 'User'
  return (
    user.full_name ||
    `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
    user.email ||
    user.mobile_number ||
    'User'
  )
}

export default function UserPasswordModal({ user, userId, open, onClose }) {
  const queryClient = useQueryClient()
  const [newPassword, setNewPassword] = useState('')
  const [editMode, setEditMode] = useState(false)

  const id = userId || user?.user_id || user?.id

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users', id, 'password-view'],
    queryFn: () => userService.get(id),
    enabled: open && Boolean(id),
  })

  const detail = unwrapData(data)
  const existingPassword =
    detail?.viewable_password ||
    getUserPassword(id, detail?.email || user?.email) ||
    ''

  useEffect(() => {
    if (!open) return
    setNewPassword('')
    setEditMode(false)
  }, [open, id])

  const resetMutation = useMutation({
    mutationFn: (nextPassword) => userService.resetPassword(id, nextPassword),
    onSuccess: (_response, nextPassword) => {
      saveUserPassword(id, nextPassword, detail?.email || user?.email)
      queryClient.invalidateQueries({ queryKey: ['users', id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
      refetch()
      setNewPassword('')
      setEditMode(false)
      toast.success('Password updated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleSave = () => {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    resetMutation.mutate(newPassword)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="User Password"
      size="sm"
      footer={
        !isLoading && !error ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            {editMode ? (
              <Button loading={resetMutation.isPending} onClick={handleSave}>
                Save Password
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setEditMode(true)}>
                Reset Password
              </Button>
            )}
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-slate-50/80 px-4 py-3">
          <p className="text-sm font-semibold text-text">{getDisplayName(detail || user)}</p>
          <p className="mt-0.5 text-xs text-muted">
            {(detail || user)?.email || (detail || user)?.mobile_number || '—'}
          </p>
        </div>

        {isLoading && (
          <div className="flex min-h-[120px] items-center justify-center">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <p className="text-center text-sm text-danger py-4">{getErrorMessage(error)}</p>
        )}

        {!isLoading && !error && !editMode && (
          <PasswordInput
            label="Password"
            value={existingPassword}
            readOnly
            placeholder={existingPassword ? '' : 'No password on record'}
            hint={
              existingPassword
                ? 'Current login password for this user. Use the eye icon to show or hide.'
                : 'No stored password yet. Use Reset Password to set one — it will appear here.'
            }
          />
        )}

        {!isLoading && !error && editMode && (
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 8 characters)"
            hint="Use the eye icon to show or hide the password."
            autoFocus
          />
        )}
      </div>
    </Modal>
  )
}
