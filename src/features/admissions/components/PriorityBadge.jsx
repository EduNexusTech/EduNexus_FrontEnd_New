import { Badge } from '@/components/ui/Badge'
import { PRIORITY_LABELS } from '../types'

const PRIORITY_VARIANT = {
  low: 'secondary',
  medium: 'default',
  high: 'warning',
  urgent: 'destructive',
}

export function PriorityBadge({ priority }) {
  return (
    <Badge variant={PRIORITY_VARIANT[priority] || 'secondary'}>
      {PRIORITY_LABELS[priority] || priority}
    </Badge>
  )
}
