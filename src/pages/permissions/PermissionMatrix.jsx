import { useQuery } from '@tanstack/react-query'
import { permissionService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'

export default function PermissionMatrix() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['permissions', 'matrix'],
    queryFn: () => permissionService.matrix({}),
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={error.message} onRetry={refetch} />

  const matrix = unwrapData(data)
  const roles = matrix?.roles || []
  const permissions = matrix?.permissions || []
  const mappings = matrix?.mappings || matrix?.matrix || {}

  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'Permissions', href: '/permissions' }, { label: 'Matrix' }]} />
      <PageHeader title="Permission Matrix" subtitle="Role × Permission overview" />

      <Card padding={false} className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-muted border-b">Permission</th>
              {roles.map((role) => (
                <th key={role.role_id || role.id} className="px-4 py-3 text-center font-semibold text-muted border-b">
                  {role.role_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr key={perm.permission_id || perm.id} className="border-b border-border hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{perm.permission_name}</p>
                  <p className="text-xs text-muted">{perm.permission_code}</p>
                </td>
                {roles.map((role) => {
                  const roleId = role.role_id || role.id
                  const permId = perm.permission_id || perm.id
                  const hasPermission =
                    mappings[roleId]?.includes?.(permId) ||
                    role.permissions?.some?.((p) => (p.permission_id || p.id) === permId)
                  return (
                    <td key={roleId} className="px-4 py-3 text-center">
                      <span className={`inline-block h-3 w-3 rounded-full ${hasPermission ? 'bg-success' : 'bg-slate-200'}`} />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
