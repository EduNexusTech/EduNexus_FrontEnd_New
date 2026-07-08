import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { FiPlay, FiPlus, FiTrash2, FiZap } from 'react-icons/fi'
import AiHubLayout from '@/layouts/AiHubLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { AUTOMATION_TEMPLATES, AUTOMATION_TRIGGERS } from '@/config/automationTemplates'
import {
  createAutomationId,
  deleteAutomation,
  listAutomations,
  saveAutomation,
  toggleAutomation,
} from '@/utils/automationStorage'
import { runAutomationActions } from '@/services/automationEngine'
import { formatDateTime } from '@/utils/format'
import { cn } from '@/utils/format'

export default function AutomationsPage() {
  const navigate = useNavigate()
  const [automations, setAutomations] = useState(listAutomations)
  const [runningId, setRunningId] = useState(null)

  const refresh = () => setAutomations(listAutomations())

  const handleToggle = (id, enabled) => {
    toggleAutomation(id, enabled)
    refresh()
    toast.success(enabled ? 'Automation enabled' : 'Automation disabled')
  }

  const handleDelete = (id) => {
    deleteAutomation(id)
    refresh()
    toast.success('Automation removed')
  }

  const handleRun = async (automation) => {
    setRunningId(automation.id)
    try {
      await runAutomationActions(automation, { navigate })
      refresh()
      toast.success(`Ran: ${automation.name}`)
    } catch {
      toast.error('Automation failed')
    } finally {
      setRunningId(null)
    }
  }

  const addFromTemplate = (template) => {
    saveAutomation({
      id: createAutomationId(),
      templateId: template.id,
      name: template.name,
      description: template.description,
      enabled: true,
      trigger: template.trigger,
      actions: template.actions,
      lastRun: null,
      runCount: 0,
      createdAt: new Date().toISOString(),
    })
    refresh()
    toast.success('Template added')
  }

  const triggerLabel = (trigger) =>
    AUTOMATION_TRIGGERS.find((t) => t.id === trigger?.type)?.label || trigger?.type

  return (
    <AiHubLayout
      title="Automations"
      subtitle="Workflow templates that run in your browser — reminders, navigation, mail drafts, and AI tips."
    >
      <div className="mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">Add from template</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {AUTOMATION_TEMPLATES.map((tpl) => (
            <Card key={tpl.id} className="flex flex-col">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-600">
                  <FiZap className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-text">{tpl.name}</h4>
                  <p className="mt-1 text-xs text-muted">{tpl.description}</p>
                  <p className="mt-2 text-xs text-primary">{triggerLabel(tpl.trigger)}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => addFromTemplate(tpl)}>
                <FiPlus className="h-4 w-4" /> Add automation
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Your automations</h3>
        {automations.length === 0 ? (
          <p className="text-sm text-muted py-8 text-center">No automations yet. Add a template above.</p>
        ) : (
          <div className="space-y-3">
            {automations.map((auto) => (
              <div
                key={auto.id}
                className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-text">{auto.name}</p>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        auto.enabled ? 'bg-success/10 text-success' : 'bg-slate-100 text-muted',
                      )}
                    >
                      {auto.enabled ? 'Active' : 'Paused'}
                    </span>
                    <span className="text-xs text-muted">{triggerLabel(auto.trigger)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{auto.description}</p>
                  <p className="mt-1 text-xs text-muted">
                    Runs: {auto.runCount || 0}
                    {auto.lastRun && ` · Last: ${formatDateTime(auto.lastRun)}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={runningId === auto.id}
                    onClick={() => handleRun(auto)}
                  >
                    <FiPlay className="h-4 w-4" /> Run now
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleToggle(auto.id, !auto.enabled)}
                  >
                    {auto.enabled ? 'Pause' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(auto.id)}>
                    <FiTrash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </AiHubLayout>
  )
}
