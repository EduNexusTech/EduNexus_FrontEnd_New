import { FiList, FiGrid, FiGitBranch } from 'react-icons/fi'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const MODE_CONFIG = {
  table: { icon: FiList, label: 'Table' },
  kanban: { icon: FiGrid, label: 'Kanban' },
  timeline: { icon: FiGitBranch, label: 'Timeline' },
}

export function ViewToggle({ value, onChange, modes = ['table', 'kanban', 'timeline'] }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
      {modes.map((mode) => {
        const { icon: Icon, label } = MODE_CONFIG[mode]
        return (
          <Button
            key={mode}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(mode)}
            className={cn('h-8 gap-1.5 px-2.5', value === mode && 'bg-card shadow-sm')}
            aria-pressed={value === mode}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        )
      })}
    </div>
  )
}
