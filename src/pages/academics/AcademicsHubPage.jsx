import { Link } from 'react-router-dom'
import { FiBook, FiCalendar, FiClock, FiGrid, FiLayers, FiUsers, FiToggleRight } from 'react-icons/fi'
import { PageHeader } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { ACADEMIC_HUB_GROUPS } from '@/config/academicDefinitions'
import { HubPageShell, HubSectionTitle, HubTileCard, HubLinkCard } from '@/components/hub/HubWidgets'

const groupIcons = {
  'Academic Setup': FiBook,
  Curriculum: FiLayers,
  'Class Allocation': FiUsers,
  'Calendar & Timetable': FiCalendar,
  'Calendar & Timetable Foundation': FiCalendar,
  'Assessment & Policies Foundation': FiBook,
}

export default function AcademicsHubPage() {
  return (
    <HubPageShell>
      <Breadcrumb items={[{ label: 'Academic Foundation' }]} />
      <PageHeader
        title="Academic Foundation"
        subtitle="Year operations, activate classes for the year, curriculum, calendar, and assessment foundations"
        actions={
          <Link to="/masters">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-slate-50">
              <FiLayers className="h-4 w-4" /> Masters (STD / Section / Map)
            </span>
          </Link>
        }
      />

      <div className="space-y-8">
        <div>
          <HubSectionTitle
            icon={FiToggleRight}
            title="Year Class Activation"
            subtitle="Standards & sections are created in Masters. Activate them here for the academic year."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <HubLinkCard
              to="/academics/class-sections"
              icon={FiToggleRight}
              label="Active / Inactive Classes"
              description="Enable or disable mapped class sections for the selected academic year. Only active ones appear in forms & workflows."
            />
            <HubLinkCard
              to="/masters/setup/standards"
              icon={FiGrid}
              label="Create STD / Section / Map"
              description="Go to Masters to create standards, sections, and mappings by school."
            />
          </div>
        </div>

        <div>
          <HubSectionTitle icon={FiLayers} title="Master Data Management" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <HubTileCard to="/mdm" icon={FiLayers} label="MDM Catalog & Adopt" />
            <HubTileCard to="/masters/boards" icon={FiBook} label="Org Boards" />
            <HubTileCard to="/masters/subjects" icon={FiBook} label="Org Subjects" />
          </div>
        </div>

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
