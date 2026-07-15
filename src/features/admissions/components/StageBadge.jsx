import { Badge } from '@/components/ui/Badge'
import { STAGE_LABELS } from '../types'

const STAGE_VARIANT = {
  enquiry: 'default',
  contacted: 'secondary',
  qualified: 'default',
  application: 'warning',
  interview: 'default',
  accepted: 'success',
  enrolled: 'success',
  lost: 'destructive',
}

export function StageBadge({ stage }) {
  return <Badge variant={STAGE_VARIANT[stage] || 'secondary'}>{STAGE_LABELS[stage] || stage}</Badge>
}
