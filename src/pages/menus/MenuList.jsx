import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { menuService } from '@/api/services'
import { unwrapData, getErrorMessage } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'
import { useOrganizationOptions, useSchoolOptions } from '@/hooks/useFormOptions'
import { getUserOrganizationId } from '@/utils/schoolScope'
import { resolveNavIcon } from '@/utils/navFromApi'
import { Card } from '@/components/ui/Card'
import { ErrorState, PageLoader } from '@/components/ui/Feedback'
import { cn } from '@/lib/utils'
import {
  NavPageShell,
  NavAdminHeader,
  NavScopeBar,
  NavStatPill,
  ToggleSwitch,
  StatusBadge,
  SequenceStepper,
  SequenceInput,
  EmptyNavState,
  Button,
  SelectField,
  Link,
  FiPlus,
  FiEdit2,
  FiChevronDown,
  FiChevronUp,
  FiLink,
} from '@/components/navigation/NavAdminUi'

function buildMenuFormLink({ organizationId, moduleId, parentId }) {
  const params = new URLSearchParams()
  if (organizationId) params.set('organization', organizationId)
  if (moduleId) params.set('module', moduleId)
  if (parentId) params.set('parent', parentId)
  const query = params.toString()
  return query ? `/menus/new?${query}` : '/menus/new'
}

function countMenus(menus = []) {
  return menus.reduce((acc, menu) => acc + 1 + countMenus(menu.children), 0)
}

function MenuTreeRows({
  menus,
  depth = 0,
  moduleId,
  organizationId,
  showSchoolControls,
  onToggle,
  onSequenceChange,
  togglingMenuId,
  savingMenuId,
}) {
  if (!menus?.length) return null

  return (
    <div className="relative">
      {menus.map((menu) => {
        const menuId = menu.menu_id || menu.id
        const isToggling = togglingMenuId === menuId
        const isSaving = savingMenuId === menuId
        const disabled = showSchoolControls && !menu.school_menu_id
        const active = menu.is_enabled !== false

        return (
          <div key={menuId || menu.menu_code} className="relative">
            {depth > 0 && (
              <span
                className="pointer-events-none absolute bottom-0 top-0 w-px bg-border/80"
                style={{ left: `${12 + (depth - 1) * 24}px` }}
              />
            )}
            <div
              className={cn(
                'group flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-b-0',
                showSchoolControls && !active && 'bg-muted/30',
                'hover:bg-muted/20',
              )}
              style={{ paddingLeft: `${16 + depth * 24}px` }}
            >
              {depth > 0 && (
                <span
                  className="pointer-events-none absolute top-1/2 h-px w-3 bg-border/80"
                  style={{ left: `${12 + (depth - 1) * 24}px` }}
                />
              )}

              {showSchoolControls ? (
                <SequenceInput
                  value={menu.sequence}
                  disabled={disabled || isSaving}
                  onSave={(sequence) => onSequenceChange(menu, { sequence })}
                />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60 text-xs font-semibold tabular-nums text-muted-foreground">
                  {menu.sequence}
                </span>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{menu.menu_name}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="font-mono">{menu.menu_code}</span>
                  {menu.url ? (
                    <span className="inline-flex max-w-[220px] items-center gap-1 truncate">
                      <FiLink className="h-3 w-3 shrink-0" />
                      {menu.url}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="ml-auto flex shrink-0 flex-wrap items-center gap-2">
                {showSchoolControls && (
                  <div className="flex items-center gap-2 rounded-lg bg-background px-2 py-1 ring-1 ring-border/60">
                    <ToggleSwitch
                      checked={Boolean(menu.is_enabled)}
                      disabled={disabled || isToggling}
                      onChange={(checked) => onToggle(menu, checked)}
                      label={`Toggle ${menu.menu_name}`}
                    />
                    <StatusBadge active={active} size="sm" />
                  </div>
                )}

                <Link to={buildMenuFormLink({ organizationId, moduleId, parentId: menuId })}>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    Sub-menu
                  </Button>
                </Link>
                <Link to={`/menus/${menuId}/edit`}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit menu">
                    <FiEdit2 className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <MenuTreeRows
              menus={menu.children}
              depth={depth + 1}
              moduleId={moduleId}
              organizationId={organizationId}
              showSchoolControls={showSchoolControls}
              onToggle={onToggle}
              onSequenceChange={onSequenceChange}
              togglingMenuId={togglingMenuId}
              savingMenuId={savingMenuId}
            />
          </div>
        )
      })}
    </div>
  )
}

function ModuleAccordion({
  module,
  moduleIndex,
  modulesLength,
  organizationId,
  showSchoolControls,
  expanded,
  onToggleExpand,
  onModuleToggle,
  onModuleUpdate,
  onModuleMove,
  onMenuToggle,
  onMenuSequenceChange,
  togglingModuleId,
  savingModuleId,
  togglingMenuId,
  savingMenuId,
}) {
  const Icon = resolveNavIcon(module.icon)
  const moduleId = module.module_id || module.id
  const moduleDisabled = showSchoolControls && !module.school_module_id
  const moduleSaving = savingModuleId === moduleId
  const moduleToggling = togglingModuleId === moduleId
  const active = module.is_enabled !== false
  const menuCount = countMenus(module.menus)

  return (
    <Card
      padding={false}
      className={cn(
        'overflow-hidden transition-shadow',
        showSchoolControls && !active && 'opacity-90',
      )}
    >
      <div
        className={cn(
          'flex cursor-pointer flex-wrap items-center gap-3 px-4 py-4 transition-colors sm:px-5',
          expanded ? 'bg-gradient-to-r from-brand-50/80 to-emerald-50/40' : 'bg-muted/20 hover:bg-muted/40',
        )}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleExpand()
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm',
            active ? 'bg-white text-brand-600 ring-1 ring-brand-100' : 'bg-slate-100 text-slate-400',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{module.module_name}</h3>
            <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border/60">
              {menuCount}
              {' '}
              {menuCount === 1 ? 'menu' : 'menus'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{module.module_code}</p>
        </div>

        {showSchoolControls && (
          <div
            className="flex flex-wrap items-center gap-2"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <SequenceStepper
              value={module.sequence}
              disabled={moduleDisabled || moduleSaving}
              onSave={(sequence) => onModuleUpdate(module, { sequence })}
              onMoveUp={() => onModuleMove(module, 'up')}
              onMoveDown={() => onModuleMove(module, 'down')}
              canMoveUp={!moduleDisabled && moduleIndex > 0}
              canMoveDown={!moduleDisabled && moduleIndex < modulesLength - 1}
            />
            <div className="flex items-center gap-2 rounded-lg bg-background px-2 py-1 ring-1 ring-border/60">
              <ToggleSwitch
                checked={Boolean(module.is_enabled)}
                disabled={moduleDisabled || moduleToggling}
                onChange={(checked) => onModuleToggle(module, checked)}
                label={`Toggle ${module.module_name}`}
              />
              <StatusBadge active={active} size="sm" />
            </div>
          </div>
        )}

        {!showSchoolControls && (
          <span className="text-xs font-medium text-muted-foreground">
            Order
            {' '}
            {module.sequence}
          </span>
        )}

        <div className="flex items-center gap-2">
          <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
            <Link to={buildMenuFormLink({ organizationId, moduleId })}>
              <Button variant="outline" size="sm" className="h-8">
                <FiPlus className="mr-1 h-3.5 w-3.5" />
                Menu
              </Button>
            </Link>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title={expanded ? 'Collapse module' : 'Expand module'}
            aria-label={expanded ? 'Collapse module' : 'Expand module'}
            aria-expanded={expanded}
          >
            {expanded ? <FiChevronUp className="h-5 w-5" /> : <FiChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/50">
          {module.menus?.length ? (
            <MenuTreeRows
              menus={module.menus}
              moduleId={moduleId}
              organizationId={organizationId}
              showSchoolControls={showSchoolControls}
              onToggle={onMenuToggle}
              onSequenceChange={onMenuSequenceChange}
              togglingMenuId={togglingMenuId}
              savingMenuId={savingMenuId}
            />
          ) : (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No menus in this module yet.
              {' '}
              <Link
                to={buildMenuFormLink({ organizationId, moduleId })}
                className="font-medium text-brand-600 hover:underline"
              >
                Add the first menu
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default function MenuList() {
  const queryClient = useQueryClient()
  const { user, isSuperAdmin } = useAuth()
  const orgQuery = useOrganizationOptions(isSuperAdmin)
  const userOrgId = getUserOrganizationId(user)
  const [organizationId, setOrganizationId] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [expandedModules, setExpandedModules] = useState({})
  const [togglingMenuId, setTogglingMenuId] = useState(null)
  const [togglingModuleId, setTogglingModuleId] = useState(null)
  const [savingMenuId, setSavingMenuId] = useState(null)
  const [savingModuleId, setSavingModuleId] = useState(null)

  useEffect(() => {
    if (organizationId) return
    if (userOrgId) setOrganizationId(userOrgId)
    else if (orgQuery.options.length === 1) setOrganizationId(orgQuery.options[0].value)
  }, [organizationId, userOrgId, orgQuery.options])

  const schoolQuery = useSchoolOptions(organizationId || undefined, Boolean(organizationId))

  useEffect(() => {
    setSchoolId('')
    setExpandedModules({})
  }, [organizationId])

  useEffect(() => {
    if (schoolId) return
    if (schoolQuery.options.length === 1) setSchoolId(schoolQuery.options[0].value)
  }, [schoolId, schoolQuery.options])

  const treeQuery = useQuery({
    queryKey: ['menus', 'school-admin-tree', organizationId, schoolId],
    queryFn: () =>
      menuService.schoolAdminTree({
        organization: organizationId,
        ...(schoolId ? { school: schoolId } : {}),
      }),
    enabled: Boolean(organizationId),
  })

  const invalidateSchoolNav = () => {
    queryClient.invalidateQueries({ queryKey: ['menus', 'school-admin-tree'] })
    queryClient.invalidateQueries({ queryKey: ['menus', 'my-menus'] })
  }

  const menuMutation = useMutation({
    mutationFn: (payload) => menuService.updateSchoolMapping(payload),
    onSuccess: () => {
      invalidateSchoolNav()
      toast.success('Menu updated for this school')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to update menu')),
    onSettled: () => {
      setTogglingMenuId(null)
      setSavingMenuId(null)
    },
  })

  const moduleMutation = useMutation({
    mutationFn: (payload) => menuService.updateSchoolModule(payload),
    onSuccess: () => {
      invalidateSchoolNav()
      toast.success('Module updated for this school')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to update module')),
    onSettled: () => {
      setTogglingModuleId(null)
      setSavingModuleId(null)
    },
  })

  const treePayload = useMemo(() => unwrapData(treeQuery.data), [treeQuery.data])
  const modules = useMemo(() => {
    const list = treePayload?.modules ?? []
    if (!schoolId) return list
    return [...list].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
  }, [treePayload?.modules, schoolId])
  const showSchoolControls = Boolean(schoolId)

  useEffect(() => {
    if (!modules.length) return
    setExpandedModules((prev) => {
      const next = { ...prev }
      modules.slice(0, 3).forEach((m) => {
        const id = String(m.module_id || m.id)
        if (next[id] === undefined) next[id] = true
      })
      return next
    })
  }, [modules])

  const stats = useMemo(() => {
    const totalMenus = modules.reduce((acc, m) => acc + countMenus(m.menus), 0)
    const activeModules = modules.filter((m) => m.is_enabled !== false).length
    return { modules: modules.length, menus: totalMenus, activeModules }
  }, [modules])

  const handleMenuToggle = (menu, isEnabled) => {
    if (!schoolId) return
    setTogglingMenuId(menu.menu_id || menu.id)
    menuMutation.mutate({
      school: schoolId,
      menu: menu.menu_id || menu.id,
      is_enabled: isEnabled,
      organization: organizationId,
    })
  }

  const handleMenuUpdate = (menu, updates) => {
    if (!schoolId) return
    setSavingMenuId(menu.menu_id || menu.id)
    menuMutation.mutate({
      school: schoolId,
      menu: menu.menu_id || menu.id,
      organization: organizationId,
      ...updates,
    })
  }

  const handleModuleToggle = (module, isEnabled) => {
    if (!schoolId) return
    setTogglingModuleId(module.module_id || module.id)
    moduleMutation.mutate({
      school: schoolId,
      module: module.module_id || module.id,
      is_enabled: isEnabled,
      organization: organizationId,
    })
  }

  const handleModuleUpdate = (module, updates) => {
    if (!schoolId) return
    setSavingModuleId(module.module_id || module.id)
    moduleMutation.mutate({
      school: schoolId,
      module: module.module_id || module.id,
      organization: organizationId,
      ...updates,
    })
  }

  const handleModuleMove = (module, direction) => {
    if (!schoolId || !modules.length) return
    const moduleId = module.module_id || module.id
    const sorted = [...modules].sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
    const index = sorted.findIndex((item) => (item.module_id || item.id) === moduleId)
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || swapIndex < 0 || swapIndex >= sorted.length) return

    const other = sorted[swapIndex]
    const moduleSeq = module.sequence ?? index + 1
    const otherSeq = other.sequence ?? swapIndex + 1

    setSavingModuleId(moduleId)
    moduleMutation.mutate({
      school: schoolId,
      module: moduleId,
      sequence: otherSeq,
      organization: organizationId,
    })
    moduleMutation.mutate({
      school: schoolId,
      module: other.module_id || other.id,
      sequence: moduleSeq,
      organization: organizationId,
    })
  }

  const toggleModuleExpand = (moduleId) => {
    const key = String(moduleId)
    setExpandedModules((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const expandAllModules = () => {
    setExpandedModules(
      Object.fromEntries(modules.map((m) => [String(m.module_id || m.id), true])),
    )
  }

  const collapseAllModules = () => {
    setExpandedModules(
      Object.fromEntries(modules.map((m) => [String(m.module_id || m.id), false])),
    )
  }

  const isModuleExpanded = (moduleId) => Boolean(expandedModules[String(moduleId)])

  if (orgQuery.isLoading) return <PageLoader />

  return (
    <NavPageShell breadcrumb={[{ label: 'Menus' }]}>
      <NavAdminHeader
        activeTab="menus"
        actions={(
          <Link to={buildMenuFormLink({ organizationId })}>
            <Button variant="create">
              <FiPlus className="mr-1.5 h-4 w-4" />
              Add Menu
            </Button>
          </Link>
        )}
      />

      <NavScopeBar
        hint={
          showSchoolControls
            ? `Configuring ${treePayload?.school_name || 'selected school'}. Inactive items are hidden from that school's admin sidebar.`
            : 'Select a school to enable per-school visibility, ordering, and sidebar preview behavior.'
        }
      >
        {(isSuperAdmin || orgQuery.options.length > 1) && (
          <SelectField
            label="Organization"
            value={organizationId}
            onChange={(e) => setOrganizationId(e.target.value)}
            options={[{ label: 'Select organization…', value: '' }, ...orgQuery.options]}
          />
        )}
        {organizationId && (
          <SelectField
            label="School"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            options={[
              { label: 'All schools (catalog only)', value: '' },
              ...schoolQuery.options,
            ]}
            disabled={schoolQuery.isLoading}
          />
        )}
      </NavScopeBar>

      {!organizationId ? (
        <EmptyNavState
          title="Select an organization"
          description="Choose an organization to browse the school admin menu catalog and configure navigation per school."
        />
      ) : treeQuery.isLoading ? (
        <PageLoader />
      ) : treeQuery.isError ? (
        <ErrorState message={getErrorMessage(treeQuery.error)} onRetry={treeQuery.refetch} />
      ) : !modules.length ? (
        <EmptyNavState
          title="No navigation catalog"
          description="Create a school to auto-provision menus, or run python manage.py provision_school_menus on the backend."
        />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-2xl">
              <NavStatPill label="Modules" value={stats.modules} />
              <NavStatPill label="Menus" value={stats.menus} />
              {showSchoolControls ? (
                <NavStatPill label="Active modules" value={stats.activeModules} tone="success" />
              ) : (
                <NavStatPill label="Mode" value="Catalog" tone="muted" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={expandAllModules}>
                <FiChevronDown className="mr-1.5 h-4 w-4" />
                Expand all
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={collapseAllModules}>
                <FiChevronUp className="mr-1.5 h-4 w-4" />
                Collapse all
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {modules.map((module, moduleIndex) => {
              const moduleId = module.module_id || module.id
              return (
                <ModuleAccordion
                  key={moduleId}
                  module={module}
                  moduleIndex={moduleIndex}
                  modulesLength={modules.length}
                  organizationId={organizationId}
                  showSchoolControls={showSchoolControls}
                  expanded={isModuleExpanded(moduleId)}
                  onToggleExpand={() => toggleModuleExpand(moduleId)}
                  onModuleToggle={handleModuleToggle}
                  onModuleUpdate={handleModuleUpdate}
                  onModuleMove={handleModuleMove}
                  onMenuToggle={handleMenuToggle}
                  onMenuSequenceChange={handleMenuUpdate}
                  togglingModuleId={togglingModuleId}
                  savingModuleId={savingModuleId}
                  togglingMenuId={togglingMenuId}
                  savingMenuId={savingMenuId}
                />
              )
            })}
          </div>
        </>
      )}
    </NavPageShell>
  )
}
