import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { householdService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'

export default function HouseholdsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['households'],
    queryFn: () => householdService.list({}),
  })

  const createMut = useMutation({
    mutationFn: () => householdService.create({ name: 'New Household' }),
    onSuccess: () => {
      toast.success('Household created')
      queryClient.invalidateQueries({ queryKey: ['households'] })
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />

  const rows = unwrapData(data)?.data ?? unwrapData(data) ?? []
  const list = Array.isArray(rows) ? rows : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Households"
        description="Family units for joint families, shared custody, and sibling grouping"
        actions={
          <>
            <Link to="/parents"><Button variant="outline">Family Hub</Button></Link>
            <Button loading={createMut.isPending} onClick={() => createMut.mutate()}>New Household</Button>
          </>
        }
      />
      <Card className="p-4">
        <ul className="space-y-2">
          {list.map((h) => (
            <li key={h.household_id} className="flex justify-between rounded-lg border px-3 py-2 text-sm">
              <div>
                <div className="font-medium">{h.name || h.household_code}</div>
                <div className="text-xs text-muted">
                  {[h.household_code, h.city, `${h.member_count ?? 0} members`].filter(Boolean).join(' · ')}
                </div>
              </div>
            </li>
          ))}
          {!list.length && <li className="text-sm text-muted">No households yet.</li>}
        </ul>
      </Card>
    </div>
  )
}
