import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiMail, FiMessageSquare } from 'react-icons/fi'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/Feedback'
import { schoolUserService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { getUserPassword, saveUserPassword } from '@/utils/userPasswordStorage'

function getDisplayName(user) {
  if (!user) return 'User'
  return (
    user.full_name ||
    `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
    user.username ||
    user.email ||
    user.mobile_number ||
    'User'
  )
}

export default function SchoolUserCredentialsModal({ user, userId, open, onClose }) {
  const queryClient = useQueryClient()
  const [newPassword, setNewPassword] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [autoSend, setAutoSend] = useState(false)

  const id = userId || user?.user_id || user?.id

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['school-users', id, 'credentials'],
    queryFn: () => schoolUserService.get(id),
    enabled: open && Boolean(id),
  })

  const detail = unwrapData(data)
  const existingPassword =
    detail?.viewable_password ||
    detail?.generated_password ||
    getUserPassword(id, detail?.email || user?.email) ||
    ''

  useEffect(() => {
    if (!open) return
    setNewPassword('')
    setEditMode(false)
    setAutoSend(false)
  }, [open, id])

  const resetMutation = useMutation({
    mutationFn: (payload) => schoolUserService.resetPassword(id, payload),
    onSuccess: (response) => {
      const body = unwrapData(response)
      const password = body?.generated_password || newPassword
      if (password) saveUserPassword(id, password, detail?.email || user?.email)
      queryClient.invalidateQueries({ queryKey: ['school-users', id] })
      queryClient.invalidateQueries({ queryKey: ['school-users'] })
      refetch()
      setNewPassword('')
      setEditMode(false)
      toast.success('Password reset successfully')
      if (body?.credential_delivery) {
        toast.success('Credentials delivery attempted')
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const sendMutation = useMutation({
    mutationFn: (payload) => schoolUserService.sendCredentials(id, payload),
    onSuccess: () => toast.success('Credentials sent'),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const handleSave = () => {
    const payload = {
      send_credentials: autoSend,
      send_email: true,
      send_sms: true,
    }
    if (newPassword.length >= 8) {
      payload.new_password = newPassword
    } else if (editMode && newPassword) {
      toast.error('Password must be at least 8 characters')
      return
    }
    resetMutation.mutate(payload)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Login Credentials"
      size="md"
      footer={
        !isLoading && !error ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="outline"
              loading={sendMutation.isPending}
              onClick={() => sendMutation.mutate({ send_email: true, send_sms: true })}
            >
              <FiMail className="h-4 w-4" /> Send Email & SMS
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
            {detail?.username ? `Username: ${detail.username}` : null}
            {(detail || user)?.email ? ` · ${(detail || user).email}` : ''}
            {(detail || user)?.mobile_number ? ` · ${(detail || user).mobile_number}` : ''}
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
            label="Temporary Password"
            value={existingPassword}
            readOnly
            placeholder={existingPassword ? '' : 'No password on record'}
            hint="Auto-generated on create. Use Reset Password to issue a new temporary password."
          />
        )}

        {!isLoading && !error && editMode && (
          <>
            <PasswordInput
              label="New Password (optional)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to auto-generate"
              hint="Minimum 8 characters if provided."
              autoFocus
            />
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => setAutoSend(e.target.checked)}
                className="rounded border-border"
              />
              Send credentials via email & SMS after reset
            </label>
          </>
        )}

        {!isLoading && !error && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="outline"
              loading={sendMutation.isPending}
              onClick={() => sendMutation.mutate({ send_email: true, send_sms: false })}
            >
              <FiMail className="h-3.5 w-3.5" /> Email only
            </Button>
            <Button
              size="sm"
              variant="outline"
              loading={sendMutation.isPending}
              onClick={() => sendMutation.mutate({ send_email: false, send_sms: true })}
            >
              <FiMessageSquare className="h-3.5 w-3.5" /> SMS only
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )

}
