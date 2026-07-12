import { Link } from 'react-router-dom'
import { FiBook, FiCalendar, FiClock, FiGrid, FiLayers, FiUsers } from 'react-icons/fi'
import { PageHeader } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { ACADEMIC_HUB_GROUPS } from '@/config/academicDefinitions'
import { HubPageShell, HubSectionTitle, HubTileCard } from '@/components/hub/HubWidgets'

const groupIcons = {
  'Academic Setup': FiBook,
  Curriculum: FiLayers,
  'Class Allocation': FiUsers,
  'Calendar & Timetable': FiCalendar,
}

export default function AcademicsHubPage() {
  return (
    <HubPageShell>
      <Breadcrumb items={[{ label: 'Academic Structure' }]} />
      <PageHeader
        title="Academic Structure"
        subtitle="Manage academic years, curriculum, class sections, calendar, and timetable"
      />

      <div className="space-y-8">
        {ACADEMIC_HUB_GROUPS.map((group) => {
          const Icon = groupIcons[group.title] || FiGrid
          return (
            <div key={group.title}>
              <HubSectionTitle icon={Icon} title={group.title} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((item) => {
                  const ItemIcon =
                    item.key.includes('timing') || item.key === 'periods' ? FiClock : Icon
                  return (
                    <HubTileCard key={item.key} to={item.path} icon={ItemIcon} label={item.label} />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </HubPageShell>
  )
}
