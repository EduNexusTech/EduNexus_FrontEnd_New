import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiEdit2, FiKey } from 'react-icons/fi'
import ResourceListPage, { StatusBadge } from '@/components/crud/ResourceListPage'
import ResourceDetailModal, { useListDetailModal } from '@/components/crud/ResourceDetailModal'
import SchoolUserCredentialsModal from '@/components/school-users/SchoolUserCredentialsModal'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Feedback'
import { schoolUserService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { SCHOOL_STAFF_ROLES } from '@/config/constants'
import { resolveRecordId } from '@/utils/record'
import { confirmDialog } from '@/utils/confirm'
import { resolveMediaUrl } from '@/utils/format'

function getUserDisplayName(user) {
  return (
    user?.full_name ||
    `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
    user?.username ||
    user?.email ||
    user?.mobile_number ||
    'User'
  )
}

function buildColumns(onCredentialsClick) {
  return [
    {
      id: 'photo',
      header: 'Photo',
      enableSorting: false,
      cell: ({ row }) => (
        <Avatar
          name={getUserDisplayName(row.original)}
          src={resolveMediaUrl(row.original.profile_image_url || row.original.profile_image)}
          size="sm"
        />
      ),
    },
    {
      id: 'name',
      header: 'Name',
      accessorFn: (row) => getUserDisplayName(row),
      cell: ({ row }) => (
        <span className="font-medium text-text">{getUserDisplayName(row.original)}</span>
      ),
    },
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'staff_role_name', header: 'Role' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'mobile_number', header: 'Mobile' },
    { accessorKey: 'is_active', header: 'Status', cell: ({ getValue }) => <StatusBadge active={getValue()} /> },
    {
      id: 'credentials',
      header: 'Credentials',
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          type="button"
          variant="view"
          size="sm"
          onClick={() => onCredentialsClick(row.original)}
          title="View credentials"
        >
          <FiKey className="h-4 w-4" />
          Credentials
        </Button>
      ),
    },
  ]
}

const DETAIL_FIELDS = [
  { key: 'username', label: 'Username' },
  { key: 'first_name', label: 'First Name' },
  { key: 'last_name', label: 'Last Name' },
  { key: 'staff_role_name', label: 'Role' },
  { key: 'email', label: 'Email' },
  { key: 'mobile_number', label: 'Mobile' },
  { key: 'school_name', label: 'School' },
  { key: 'must_change_password', label: 'Must Change Password', render: (item) => (item.must_change_password ? 'Yes' : 'No') },
  { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
]

function SchoolUserDetailModal({ userId, open, onClose, onViewCredentials }) {
  const queryClient = useQueryClient()
  const id = userId

  const activateMutation = useMutation({
    mutationFn: () => schoolUserService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-users'] })
      toast.success('User activated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => schoolUserService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-users'] })
      toast.success('User deactivated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const resetPasswordMutation = useMutation({
    mutationFn: () => schoolUserService.resetPassword(id, { send_credentials: false }),
    onSuccess: () => toast.success('Password reset successfully'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const handleResetPassword = async () => {
    const confirmed = await confirmDialog({
      title: 'Reset Password',
      text: 'Generate a new temporary password for this user?',
      confirmButtonText: 'Reset',
    })
    if (confirmed) resetPasswordMutation.mutate()
  }

  return (
    <ResourceDetailModal
      recordId={id}
      open={open}
      onClose={onClose}
      queryKey="school-users"
      getFn={schoolUserService.get}
      getTitle={(item) => getUserDisplayName(item)}
      fields={DETAIL_FIELDS}
      renderFooter={(item, recordId, close) => {
        const userRecordId = item.user_id || item.id || recordId
        return (
          <>
            <Button variant="cancel" onClick={close}>Close</Button>
            <Button
              variant="view"
              onClick={() => {
                onViewCredentials?.(item)
                close()
              }}
            >
              <FiKey className="h-4 w-4" /> Credentials
            </Button>
            <Link to={`/school-users/${userRecordId}/edit`} onClick={close}>
              <Button variant="edit"><FiEdit2 className="h-4 w-4" /> Edit</Button>
            </Link>
            <Link to={`/school-users/${userRecordId}`} onClick={close}>
              <Button variant="view">Full Detail</Button>
            </Link>
            <Button variant="secondary" onClick={handleResetPassword} loading={resetPasswordMutation.isPending}>
              Reset Password
            </Button>
            {item.is_active ? (
              <Button variant="danger" loading={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate()}>
                Deactivate
              </Button>
            ) : (
              <Button variant="success" loading={activateMutation.isPending} onClick={() => activateMutation.mutate()}>
                Activate
              </Button>
            )}
          </>
        )
      }}
    />
  )
}

export default function SchoolUserList() {
  const { viewId, isOpen, openView, closeView } = useListDetailModal()
  const [credentialsUser, setCredentialsUser] = useState(null)
  const [staffRole, setStaffRole] = useState('')

  const listParams = useMemo(
    () => (staffRole ? { staff_role: staffRole } : {}),
    [staffRole],
  )

  const columns = buildColumns((user) => setCredentialsUser(user))

  const roleFilter = (
    <SelectField
      label=""
      value={staffRole}
      onChange={(e) => setStaffRole(e.target.value)}
      options={[{ label: 'All roles', value: '' }, ...SCHOOL_STAFF_ROLES]}
      className="min-w-[180px]"
    />
  )

  return (
    <>
      <ResourceListPage
        title="School Users"
        subtitle="Teachers, students, parents, and school staff"
        queryKey="school-users"
        listFn={schoolUserService.list}
        listParams={listParams}
        deleteFn={schoolUserService.delete}
        deleteSuccessMessage="User deactivated"
        deleteBehavior="deactivate"
        basePath="/school-users"
        columns={columns}
        filters={roleFilter}
        onView={(item) => openView(item, resolveRecordId(item))}
      />

      <SchoolUserDetailModal
        userId={viewId}
        open={isOpen}
        onClose={closeView}
        onViewCredentials={setCredentialsUser}
      />

      <SchoolUserCredentialsModal
        user={credentialsUser}
        userId={credentialsUser ? resolveRecordId(credentialsUser) : null}
        open={Boolean(credentialsUser)}
        onClose={() => setCredentialsUser(null)}
      />
    </>
  )
}
