import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FiArrowRight,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiLayers,
  FiList,
  FiPlus,
  FiSettings,
} from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import Button from '@/components/ui/Button'
import { SelectField } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { HubPageShell, HubLinkCard, HubStatGrid } from '@/components/hub/HubWidgets'
import {
  FEE_SIMPLE_STEPS,
  FEE_HUB_MODULES,
  FEE_MASTER_NAV,
} from '@/config/feeDefinitions'
import { feesService, academicYearService } from '@/api/services'
import { unwrapList } from '@/api/client'
import { useSchoolScopedSelection } from '@/hooks/useSchoolScopedSelection'

function unwrap(res) {
  return res?.data?.data ?? res?.data ?? res ?? {}
}

const STEP_ICONS = [FiList, FiLayers, FiPlus, FiCreditCard, FiFileText]

export default function FeesHubPage() {
  const schoolScope = useSchoolScopedSelection()
  const [yearId, setYearId] = useState('')

  const listConfig = useMemo(
    () => ({
      params: { school: schoolScope.schoolId },
      ...schoolScope.listRequestConfig,
    }),
    [schoolScope.listRequestConfig, schoolScope.schoolId],
  )

  const yearsQuery = useQuery({
    queryKey: ['fees-hub-years', schoolScope.schoolId],
    queryFn: () =>
      academicYearService.list({
        school: schoolScope.schoolId,
        page_size: 100,
        ordering: '-start_date',
      }),
    enabled: Boolean(schoolScope.schoolId),
  })

  const yearOptions = useMemo(() => {
    const { results } = unwrapList(yearsQuery.data)
    return (results || []).map((y) => ({
      label: y.is_current ? `${y.name} (current)` : y.name,
      value: String(y.id),
    }))
  }, [yearsQuery.data])

  useEffect(() => {
    if (!yearId && yearOptions.length) {
      const current = yearOptions.find((y) => y.label.includes('(current)'))
      setYearId(current?.value || yearOptions[0].value)
    }
  }, [yearId, yearOptions])

  const dashQuery = useQuery({
    queryKey: ['fees-dashboard', schoolScope.schoolId, yearId],
    queryFn: () =>
      feesService.dashboard(
        { school: schoolScope.schoolId, academic_year: yearId },
        listConfig,
      ),
    enabled: Boolean(schoolScope.schoolId),
  })

  const dash = useMemo(() => unwrap(dashQuery.data), [dashQuery.data])

  const stats = [
    { label: 'Collected', value: dash.total_collected ?? '—' },
    { label: 'Outstanding', value: dash.outstanding ?? '—' },
    { label: 'Overdue', value: dash.overdue ?? '—' },
    { label: 'Pending Approvals', value: String(dash.concessions_pending ?? '0') },
  ]

  return (
    <HubPageShell>
      <Breadcrumb items={[{ label: 'Fee Management' }]} />
      <PageHeader
        title="Enterprise Fee Management"
        description="Masters → structure → generate → collect → reports — full billing engine"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/fees/masters"><Button variant="outline"><FiList className="h-4 w-4" /> Masters</Button></Link>
            <Link to="/fees/collect"><Button variant="primary"><FiCreditCard className="h-4 w-4" /> Collect Payment</Button></Link>
          </div>
        }
      />

      <Card className="mb-6 p-5">
        <p className="mb-3 text-sm font-medium text-slate-700">Select school &amp; academic year</p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <SchoolScopeInline scope={schoolScope} />
          <div className="w-full min-w-[12rem] lg:max-w-xs lg:flex-1">
            <SelectField
              label="Academic year"
              value={yearId}
              onChange={(e) => setYearId(e.target.value)}
              options={[{ label: 'Select…', value: '' }, ...yearOptions]}
              disabled={!schoolScope.schoolId}
            />
          </div>
        </div>
      </Card>

      {schoolScope.schoolId ? <HubStatGrid stats={stats} /> : null}

      <div className="mb-8 mt-6">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
          <FiDollarSign className="h-5 w-5" /> Core workflow
        </h2>
        <p className="mb-4 text-sm text-muted">Setup masters, build structures, assign fees, collect payments.</p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {FEE_SIMPLE_STEPS.map((step, idx) => {
            const Icon = STEP_ICONS[idx] || FiFileText
            return (
              <Link
                key={step.key}
                to={step.path}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {step.step}
                  </span>
                  <Icon className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                </div>
                <p className="font-semibold text-slate-900">{step.label}</p>
                <p className="mt-1 flex-1 text-sm text-muted">{step.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open <FiArrowRight className="h-4 w-4" />
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Enterprise modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEE_HUB_MODULES.map((item) => (
            <HubLinkCard
              key={item.key}
              to={item.path}
              icon={item.key === 'settings' ? FiSettings : FiFileText}
              label={item.label}
              description={item.desc}
            />
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Fee masters</h2>
        <div className="flex flex-wrap gap-2">
          {FEE_MASTER_NAV.map((m) => (
            <Link
              key={m.key}
              to={m.path}
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-primary/40 hover:bg-muted/30"
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>
    </HubPageShell>
  )
}

function SchoolScopeInline({ scope }) {
  if (scope.schoolLocked && scope.selectedSchoolLabel) {
    return (
      <div className="w-full min-w-[12rem] lg:max-w-xs lg:flex-1">
        <p className="mb-1 block text-sm font-medium text-black">School</p>
        <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium">
          {scope.selectedSchoolLabel}
        </p>
      </div>
    )
  }
  return (
    <div className="w-full min-w-[12rem] lg:max-w-xs lg:flex-1">
      <SelectField
        label="School"
        value={scope.schoolId}
        onChange={(e) => scope.setSchoolId(e.target.value)}
        options={scope.schoolOptions}
        placeholder="Select school…"
      />
    </div>
  )
}
