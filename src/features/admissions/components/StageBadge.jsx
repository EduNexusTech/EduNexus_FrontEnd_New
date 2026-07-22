import { Badge } from '@/components/ui/Badge'
import { STAGE_LABELS } from '../types'

const STAGE_VARIANT = {
  enquiry: 'default',
  counselling: 'secondary',
  campus_visit: 'default',
  application: 'warning',
  accepted: 'success',
  enrolled: 'success',
  lost: 'destructive',
  // legacy
  contacted: 'secondary',
  qualified: 'default',
  interview: 'default',
}

export function StageBadge({ stage }) {
  return <Badge variant={STAGE_VARIANT[stage] || 'secondary'}>{STAGE_LABELS[stage] || stage}</Badge>
}
