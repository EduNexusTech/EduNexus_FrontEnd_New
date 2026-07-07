import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { roleService, permissionService } from '@/api/services'
import { unwrapData, unwrapList, getErrorMessage } from '@/api/client'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import { PageLoader } from '@/components/ui/Feedback'

export default function RolePermissions() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState([])

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ['roles', id],
    queryFn: () => roleService.get(id),
  })

  const { data: permData, isLoading: permLoading } = useQuery({
    queryKey: ['permissions', 'all'],
    queryFn: () => permissionService.list({ page_size: 500 }),
  })

  const { data: rolePerms, isLoading: rpLoading } = useQuery({
    queryKey: ['roles', id, 'permissions'],
    queryFn: () => roleService.getPermissions(id),
  })

  useEffect(() => {
    if (rolePerms) {
      const perms = unwrapData(rolePerms)
      const ids = (Array.isArray(perms) ? perms : perms?.permissions || []).map((p) => p.permission_id || p.id)
      setSelected(ids)
    }
  }, [rolePerms])

  const mutation = useMutation({
    mutationFn: () => roleService.syncPermissions(id, selected),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', id, 'permissions'] })
      toast.success('Permissions updated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (roleLoading || permLoading || rpLoading) return <PageLoader />

  const role = unwrapData(roleData)
  const allPerms = unwrapList(permData).results || []

  const toggle = (permId) => {
    setSelected((prev) =>
      prev.includes(permId) ? prev.filter((x) => x !== permId) : [...prev, permId],
    )
  }

  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'Roles', href: '/roles' }, { label: role?.role_name || 'Permissions' }]} />
      <PageHeader title={`Permissions: ${role?.role_name}`} subtitle="Assign permissions to this role" />

      <Card>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 mb-6">
          {allPerms.map((perm) => (
            <label key={perm.permission_id || perm.id} className="flex items-center gap-2 rounded-xl border border-border p-3 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={selected.includes(perm.permission_id || perm.id)}
                onChange={() => toggle(perm.permission_id || perm.id)}
                className="rounded"
              />
              <div>
                <p className="text-sm font-medium">{perm.permission_name}</p>
                <p className="text-xs text-muted">{perm.permission_code}</p>
              </div>
            </label>
          ))}
        </div>
        <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>Save Permissions</Button>
      </Card>
    </div>
  )
}
