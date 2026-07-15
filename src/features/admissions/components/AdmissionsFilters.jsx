import { useState } from 'react'
import { FiFilter, FiChevronDown } from 'react-icons/fi'
import { PIPELINE_STAGES, ENQUIRY_SOURCE_LABELS, PRIORITY_LABELS, GRADES } from '../types'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export function AdmissionsFiltersPanel({ filters, onChange, onReset, hideStage }) {
  const [open, setOpen] = useState(false)

  const activeCount = [
    !hideStage && filters.stage !== 'all',
    filters.source !== 'all',
    filters.priority !== 'all',
    filters.grade !== 'all',
  ].filter(Boolean).length

  return (
    <Card padding={false}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <FiFilter className="h-4 w-4" />
          Advanced Filters
          {activeCount > 0 ? (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700">
              {activeCount}
            </span>
          ) : null}
        </span>
        <FiChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>

      {open ? (
        <CardContent className="border-t border-border pt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {!hideStage ? (
              <FilterSelect
                label="Stage"
                value={filters.stage}
                onChange={(v) => onChange({ stage: v })}
                options={[{ value: 'all', label: 'All stages' }, ...PIPELINE_STAGES.map((s) => ({ value: s.id, label: s.label }))]}
              />
            ) : null}
            <FilterSelect
              label="Source"
              value={filters.source}
              onChange={(v) => onChange({ source: v })}
              options={[
                { value: 'all', label: 'All sources' },
                ...Object.entries(ENQUIRY_SOURCE_LABELS).map(([value, label]) => ({ value, label })),
              ]}
            />
            <FilterSelect
              label="Priority"
              value={filters.priority}
              onChange={(v) => onChange({ priority: v })}
              options={[
                { value: 'all', label: 'All priorities' },
                ...Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label })),
              ]}
            />
            <FilterSelect
              label="Grade"
              value={filters.grade}
              onChange={(v) => onChange({ grade: v })}
              options={[{ value: 'all', label: 'All grades' }, ...GRADES.map((g) => ({ value: g, label: g }))]}
            />
          </div>
          {activeCount > 0 ? (
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={onReset}>
                Clear filters
              </Button>
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <select className="lms-select w-full" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
