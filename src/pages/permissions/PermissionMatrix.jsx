import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { permissionService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { useOrganizationOptions } from '@/hooks/useFormOptions'
import { useTenant } from '@/contexts/TenantContext'
import { useAuth } from '@/contexts/AuthContext'

export default function PermissionMatrix() {
  const { user } = useAuth()
  const { organizationId: tenantOrgId } = useTenant()
  const orgQuery = useOrganizationOptions()
  const [organizationId, setOrganizationId] = useState('')

  useEffect(() => {
    if (organizationId) return
    if (tenantOrgId) {
      setOrganizationId(String(tenantOrgId))
      return
    }
    if (orgQuery.options.length === 1) {
      setOrganizationId(orgQuery.options[0].value)
    }
  }, [organizationId, tenantOrgId, orgQuery.options])

  const isSuperAdmin = user?.is_super_admin === true
  const showOrgPicker = isSuperAdmin || orgQuery.options.length > 1

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['permissions', 'matrix', organizationId],
    queryFn: () => permissionService.matrix({ organization: organizationId }),
    enabled: Boolean(organizationId),
  })

  const matrix = useMemo(() => unwrapData(data) || {}, [data])
  const roles = matrix?.roles || []
  const permissions = matrix?.permissions || []
  const assignments = matrix?.assignments || matrix?.mappings || matrix?.matrix || {}

  if (orgQuery.isLoading) return <PageLoader />
  if (orgQuery.error) {
    return (
      <ErrorState
        message={getErrorMessage(orgQuery.error, 'Failed to load organizations')}
        onRetry={orgQuery.refetch}
      />
    )
  }

  if (!orgQuery.options.length) {
    return (
      <div className="w-full">
        <Breadcrumb items={[{ label: 'Permissions', href: '/permissions' }, { label: 'Matrix' }]} />
        <PageHeader title="Permission Matrix" subtitle="Role × Permission overview" />
        <Card className="py-12 text-center">
          <p className="text-sm text-muted">Create an organization first to view the permission matrix.</p>
          <Link to="/organizations/new" className="mt-4 inline-block">
            <Button>Add Organization</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <Breadcrumb items={[{ label: 'Permissions', href: '/permissions' }, { label: 'Matrix' }]} />
      <PageHeader
        title="Permission Matrix"
        subtitle={
          matrix?.organization_name
            ? `Role × Permission overview for ${matrix.organization_name}`
            : 'Role × Permission overview'
        }
        actions={
          <Link to="/permissions">
            <Button variant="secondary">Back to Permissions</Button>
          </Link>
        }
      />

      {showOrgPicker && (
        <Card className="max-w-xl">
          <SelectField
            label="Organization"
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            options={orgQuery.options}
            placeholder="Select organization"
            required
          />
        </Card>
      )}

      {!organizationId ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-muted">Select an organization to load the permission matrix.</p>
        </Card>
      ) : isLoading || isFetching ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
      ) : roles.length === 0 && permissions.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-muted">
            No roles or permissions found for this organization yet.
          </p>
        </Card>
      ) : (
        <Card padding={false} className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-muted border-b">Permission</th>
                {roles.map((role) => (
                  <th
                    key={role.role_id || role.id}
                    className="px-4 py-3 text-center font-semibold text-muted border-b"
                  >
                    {role.role_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(roles.length + 1, 1)} className="px-4 py-10 text-center text-sm text-muted">
                    No permissions found for this organization.
                  </td>
                </tr>
              ) : (
                permissions.map((perm) => {
                  const permId = String(perm.permission_id || perm.id)
                  return (
                    <tr key={permId} className="border-b border-border hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{perm.permission_name}</p>
                        <p className="text-xs text-muted">{perm.permission_code}</p>
                      </td>
                      {roles.map((role) => {
                        const roleId = String(role.role_id || role.id)
                        const assigned = assignments[roleId] || []
                        const hasPermission =
                          assigned.includes(permId) ||
                          role.permissions?.some?.(
                            (p) => String(p.permission_id || p.id) === permId,
                          )
                        return (
                          <td key={roleId} className="px-4 py-3 text-center">
                            <span
                              className={`inline-block h-3 w-3 rounded-full ${
                                hasPermission ? 'bg-success' : 'bg-slate-200'
                              }`}
                              title={hasPermission ? 'Granted' : 'Not granted'}
                            />
                          </td>
                        )
                      })}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
