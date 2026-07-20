import { FiFileText, FiPlus, FiDownload, FiSearch } from 'react-icons/fi'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, StatCard } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

/**
 * LMS_School-style module page layout:
 * PageHeader → optional StatCards → Card with toolbar + empty content area.
 */
export default function ModulePage({
  title,
  description,
  stats = [],
  actions,
  children,
  emptyTitle = 'No records yet',
  emptyDescription = 'This module matches the LMS_School layout. Connect data and build feature-specific tables here.',
  showToolbar = true,
  searchPlaceholder = 'Search...',
  hideHeader = false,
}) {
  return (
    <div className="space-y-6">
      {!hideHeader && title ? (
        <PageHeader
          title={title}
          description={description}
          actions={
            actions ?? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline">
                  <FiDownload className="h-4 w-4" />
                  Export
                </Button>
                <Button variant="primary">
                  <FiPlus className="h-4 w-4" />
                  Add New
                </Button>
              </div>
            )
          }
        />
      ) : null}

      {stats.length > 0 ? (
        <div className={`grid gap-4 sm:grid-cols-2 ${stats.length >= 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'}`}>
          {stats.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>
      ) : null}

      <Card padding={false}>
        <CardContent className="space-y-4 p-6">
          {showToolbar ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                <FiSearch className="h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-sm font-bold text-black">0 results</p>
            </div>
          ) : null}

          {children ?? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FiFileText className="h-6 w-6" />
              </div>
              <h3 className="page-title text-base font-bold text-black">{emptyTitle}</h3>
              <p className="page-description mt-1 max-w-md text-sm font-bold text-black">{emptyDescription}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
