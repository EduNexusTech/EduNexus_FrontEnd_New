import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiKey, FiMonitor, FiClock } from 'react-icons/fi'
import { ResourceDetailPage } from '@/components/crud/ResourceFormPage'
import SchoolUserCredentialsModal from '@/components/school-users/SchoolUserCredentialsModal'
import { schoolUserService } from '@/api/services'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageLoader, StatusBadge } from '@/components/ui/Feedback'
import { Avatar } from '@/components/ui/Feedback'
import { getErrorMessage, unwrapData } from '@/api/client'
import { confirmDialog } from '@/utils/confirm'
import { resolveMediaUrl } from '@/utils/format'
import dayjs from 'dayjs'

function HistoryTable({ rows, columns, emptyMessage }) {
  if (!rows?.length) {
    return <p className="text-sm text-muted py-4">{emptyMessage}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            {columns.map((col) => (
              <th key={col.key} className="px-3 py-2 font-medium">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border/60">
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2 text-text">
                  {col.render ? col.render(row) : row[col.key] || '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SchoolUserHistoryPanels({ userId }) {
  const loginQuery = useQuery({
    queryKey: ['school-users', userId, 'login-history'],
    queryFn: () => schoolUserService.loginHistory(userId),
    enabled: Boolean(userId),
  })

  const devicesQuery = useQuery({
    queryKey: ['school-users', userId, 'devices'],
    queryFn: () => schoolUserService.devices(userId),
    enabled: Boolean(userId),
  })

  const loginRows = unwrapData(loginQuery.data)?.results || []
  const deviceRows = unwrapData(devicesQuery.data)?.results || []

  if (loginQuery.isLoading || devicesQuery.isLoading) return <PageLoader />

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <FiClock className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-text">Login History</h3>
        </div>
        <HistoryTable
          rows={loginRows}
          emptyMessage="No login sessions recorded yet."
          columns={[
            { key: 'login_at', label: 'Login', render: (r) => dayjs(r.login_at).format('DD MMM YYYY HH:mm') },
            { key: 'ip_address', label: 'IP' },
            { key: 'device_label', label: 'Device' },
            {
              key: 'success',
              label: 'Result',
              render: (r) => (
                <span className={r.success ? 'text-emerald-600' : 'text-danger'}>
                  {r.success ? 'Success' : r.failure_reason || 'Failed'}
                </span>
              ),
            },
          ]}
        />
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <FiMonitor className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-text">Device History</h3>
        </div>
        <HistoryTable
          rows={deviceRows}
          emptyMessage="No devices recorded yet."
          columns={[
            { key: 'device_label', label: 'Device' },
            { key: 'ip_address', label: 'Last IP' },
            { key: 'login_count', label: 'Logins' },
            {
              key: 'last_seen_at',
              label: 'Last Seen',
              render: (r) => (r.last_seen_at ? dayjs(r.last_seen_at).format('DD MMM YYYY HH:mm') : '—'),
            },
            {
              key: 'is_trusted',
              label: 'Trusted',
              render: (r) => (r.is_trusted ? 'Yes' : 'No'),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default function SchoolUserDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [credentialsOpen, setCredentialsOpen] = useState(false)

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
    mutationFn: () => schoolUserService.resetPassword(id, { send_credentials: true }),
    onSuccess: () => toast.success('Password reset and credentials sent'),
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const handleResetPassword = async () => {
    const confirmed = await confirmDialog({
      title: 'Reset Password',
      text: 'Generate a new temporary password and optionally send credentials?',
      confirmButtonText: 'Reset',
    })
    if (confirmed) resetPasswordMutation.mutate()
  }

  return (
    <>
      <ResourceDetailPage
        title="School User"
        queryKey="school-users"
        getFn={schoolUserService.get}
        basePath="/school-users"
        fields={[
          {
            key: 'profile_image_url',
            label: 'Photo',
            render: (item) => (
              <Avatar
                name={item.full_name || item.username}
                src={resolveMediaUrl(item.profile_image_url)}
                size="md"
              />
            ),
          },
          { key: 'username', label: 'Username' },
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'staff_role_name', label: 'Role' },
          { key: 'email', label: 'Email' },
          { key: 'mobile_number', label: 'Mobile' },
          { key: 'school_name', label: 'School' },
          { key: 'must_change_password', label: 'Must Change Password', render: (item) => (item.must_change_password ? 'Yes' : 'No') },
          { key: 'is_active', label: 'Status', render: (item) => <StatusBadge active={item.is_active} /> },
        ]}
        actions={(item) => (
          <>
            <Button variant="outline" onClick={() => setCredentialsOpen(true)}>
              <FiKey className="h-4 w-4" /> Credentials
            </Button>
            <Link to={`/school-users/${id}/edit`}><Button variant="secondary">Edit</Button></Link>
            <Button variant="outline" onClick={handleResetPassword} loading={resetPasswordMutation.isPending}>
              Reset Password
            </Button>
            {item.is_active ? (
              <Button variant="danger" onClick={() => deactivateMutation.mutate()} loading={deactivateMutation.isPending}>
                Deactivate
              </Button>
            ) : (
              <Button onClick={() => activateMutation.mutate()} loading={activateMutation.isPending}>
                Activate
              </Button>
            )}
          </>
        )}
        renderExtra={() => <SchoolUserHistoryPanels userId={id} />}
      />

      <SchoolUserCredentialsModal
        userId={id}
        open={credentialsOpen}
        onClose={() => setCredentialsOpen(false)}
      />
    </>
  )
}
