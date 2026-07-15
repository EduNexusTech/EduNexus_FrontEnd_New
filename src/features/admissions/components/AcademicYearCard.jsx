import { useState } from 'react'
import { FiEdit2, FiTrash2, FiStar, FiPower } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { ADMISSION_FEATURE_META } from '../types/setup'
import { cn } from '@/lib/utils'

const FEATURE_GROUPS = [
  { id: 'admissions', label: 'Admission Process' },
  { id: 'academics', label: 'Academic Modules' },
]

export function AcademicYearCard({
  year,
  onEdit,
  onDelete,
  onToggleStatus,
  onSetCurrent,
  onToggleFeature,
}) {
  const [expanded, setExpanded] = useState(false)

  const enabledCount = Object.values(year.features).filter(Boolean).length
  const totalFeatures = Object.keys(year.features).length

  return (
    <Card
      padding={false}
      className={cn(year.isCurrent && 'border-brand-300 ring-1 ring-brand-200')}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{year.label}</CardTitle>
              {year.isCurrent ? (
                <Badge variant="default">
                  <FiStar className="mr-1 inline h-3 w-3" />
                  Current
                </Badge>
              ) : null}
              <Badge variant={year.status === 'active' ? 'success' : 'secondary'}>
                {year.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(year.startDate)} — {formatDate(year.endDate)}
            </p>
            <p className="text-xs text-muted-foreground">
              {enabledCount} of {totalFeatures} modules enabled
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {!year.isCurrent ? (
              <Button variant="outline" size="sm" onClick={() => onSetCurrent(year.id)}>
                Set Current
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={() => onToggleStatus(year.id)}>
              <FiPower className="h-3.5 w-3.5" />
              {year.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(year)}>
              <FiEdit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(year.id)}
              disabled={year.isCurrent}
              title={year.isCurrent ? 'Cannot delete current year' : 'Delete year'}
            >
              <FiTrash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Hide' : 'Show'} admission modules
        </Button>

        {expanded ? (
          <div className="space-y-6">
            {FEATURE_GROUPS.map((group) => {
              const features = Object.keys(ADMISSION_FEATURE_META).filter(
                (key) => ADMISSION_FEATURE_META[key].group === group.id,
              )

              return (
                <div key={group.id} className="space-y-3">
                  <h4 className="text-sm font-semibold">{group.label}</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {features.map((feature) => {
                      const meta = ADMISSION_FEATURE_META[feature]
                      return (
                        <Checkbox
                          key={feature}
                          label={meta.label}
                          description={meta.description}
                          checked={year.features[feature]}
                          disabled={year.status === 'inactive'}
                          onChange={() => onToggleFeature(year.id, feature)}
                        />
                      )
                    })}
                  </div>
                  {year.status === 'inactive' ? (
                    <p className="text-xs text-amber-600">
                      Activate this academic year to enable or disable modules.
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
