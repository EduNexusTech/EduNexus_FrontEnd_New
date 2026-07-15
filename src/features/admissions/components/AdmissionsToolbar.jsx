import { FiSearch, FiPlus } from 'react-icons/fi'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ViewToggle } from './ViewToggle'

export function AdmissionsToolbar({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  resultCount,
  onAddNew,
  addLabel = 'Add Enquiry',
  viewModes,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search by name, email, phone, ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="lms-input w-full pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{resultCount}</span> results
        </p>
      </div>

      <div className="flex items-center gap-2">
        <ViewToggle value={viewMode} onChange={onViewModeChange} modes={viewModes} />
        {onAddNew ? (
          <Button variant="create" onClick={onAddNew}>
            <FiPlus className="h-4 w-4" />
            <span className="hidden sm:inline">{addLabel}</span>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
