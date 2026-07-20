import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { FiBookOpen, FiCheck, FiDatabase, FiLayers, FiRefreshCw } from 'react-icons/fi'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import { HubPageShell, HubSectionTitle, HubTileCard } from '@/components/hub/HubWidgets'
import { mdmService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'

function unwrapPayload(response) {
  return response?.data?.data ?? response?.data ?? response ?? null
}

export default function MdmHubPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const organizationId = user?.organization_id || user?.organization || null
  const schoolId = user?.school_id || user?.school || null
  const [selectedBoard, setSelectedBoard] = useState('cbse')

  const summaryQuery = useQuery({
    queryKey: ['mdm-catalog-summary'],
    queryFn: () => mdmService.catalogSummary(),
  })
  const boardsQuery = useQuery({
    queryKey: ['mdm-catalog-boards'],
    queryFn: () => mdmService.listBoards(),
  })
  const contractQuery = useQuery({
    queryKey: ['mdm-contract'],
    queryFn: () => mdmService.getContract(),
  })

  const summary = unwrapPayload(summaryQuery.data) || {}
  const boards = useMemo(() => {
    const raw = unwrapPayload(boardsQuery.data)
    return Array.isArray(raw) ? raw : raw?.results || []
  }, [boardsQuery.data])
  const contract = unwrapPayload(contractQuery.data) || {}

  const adoptPack = useMutation({
    mutationFn: () =>
      mdmService.adoptPack({
        organization_id: organizationId || undefined,
        board_code: selectedBoard,
        school_id: schoolId || undefined,
        include_subjects: true,
        include_grading: Boolean(schoolId),
        include_calendar: false,
      }),
    onSuccess: (res) => {
      const data = unwrapPayload(res) || {}
      toast.success(
        `Adopted ${data.board?.name || selectedBoard}` +
          (data.subjects_count != null ? ` · ${data.subjects_count} subjects` : ''),
      )
      queryClient.invalidateQueries({ queryKey: ['mdm-catalog-summary'] })
      queryClient.invalidateQueries({ queryKey: ['mdm-catalog-boards'] })
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <HubPageShell>
      <Breadcrumb items={[{ label: 'Academic Foundation', href: '/academics' }, { label: 'MDM' }]} />
      <PageHeader
        title="Master Data Management"
        subtitle="Central catalog for boards, subjects, curricula, grading schemes, and calendars — every module must reference these entities"
        actions={
          <Button variant="refresh" onClick={() => summaryQuery.refetch()}>
            <FiRefreshCw /> Refresh
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Boards', summary.boards],
          ['Subjects', summary.subjects],
          ['Curricula', summary.curriculum_templates],
          ['Grading', summary.grading_schemes],
          ['Calendars', summary.calendar_templates],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value ?? '—'}</p>
          </Card>
        ))}
      </div>

      <div className="mb-10 space-y-4">
        <HubSectionTitle icon={FiDatabase} title="Adopt Board Pack" />
        <Card className="p-5">
          <p className="mb-4 text-sm text-muted">
            Copy a platform board (and its subjects / grading) into your organization masters.
            School-year calendars and curricula stay under Academic Foundation after adoption.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block text-sm">
              <span className="mb-1 block text-muted">Platform board</span>
              <select
                className="min-w-[200px] rounded-lg border border-border px-3 py-2"
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
              >
                {boards.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </label>
            <Button
              loading={adoptPack.isPending}
              onClick={() => adoptPack.mutate()}
              disabled={!selectedBoard}
            >
              <FiCheck /> Adopt into Organization
            </Button>
            <Link to="/masters/boards">
              <Button variant="secondary">View Org Boards</Button>
            </Link>
          </div>
        </Card>
      </div>

      <div className="mb-10 space-y-4">
        <HubSectionTitle icon={FiLayers} title="MDM Layers" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(contract.layers || [
            { layer: 'platform', description: 'System catalog (CBSE, ICSE, IB, …)' },
            { layer: 'organization', description: 'Adopted org masters' },
            { layer: 'school_year', description: 'Year-bound academics' },
          ]).map((layer) => (
            <Card key={layer.layer} className="p-4">
              <p className="font-medium capitalize">{layer.layer.replace('_', ' ')}</p>
              <p className="mt-2 text-sm text-muted">{layer.description}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-10 space-y-4">
        <HubSectionTitle icon={FiBookOpen} title="Manage Local Catalogs" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <HubTileCard to="/masters/boards" icon={FiLayers} label="Boards" />
          <HubTileCard to="/masters/subjects" icon={FiBookOpen} label="Subjects" />
          <HubTileCard to="/masters/classes" icon={FiDatabase} label="Standards" />
          <HubTileCard to="/academics/curriculums" icon={FiBookOpen} label="Curricula" />
          <HubTileCard to="/academics/grading-schemes" icon={FiLayers} label="Grading Schemes" />
          <HubTileCard to="/academics/calendar-events" icon={FiDatabase} label="Academic Calendar" />
          <HubTileCard to="/academics" icon={FiBookOpen} label="Academic Foundation" />
        </div>
      </div>

      {contract.module_consumers && (
        <div className="space-y-4">
          <HubSectionTitle title="Consumer Contract" />
          <Card className="overflow-x-auto p-4">
            <p className="mb-3 text-sm text-muted">
              {contract.rule ||
                'Future modules must FK these MDM entities — never invent parallel catalogs.'}
            </p>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="py-2 pr-4">Module</th>
                  <th className="py-2">Must reference</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(contract.module_consumers).map(([module, refs]) => (
                  <tr key={module} className="border-b border-border/60">
                    <td className="py-2 pr-4 font-medium capitalize">{module.replace('_', ' ')}</td>
                    <td className="py-2 text-muted">{(refs || []).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </HubPageShell>
  )
}
