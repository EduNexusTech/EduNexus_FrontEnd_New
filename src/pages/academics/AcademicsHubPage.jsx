import { Link } from 'react-router-dom'
import { FiBook, FiCalendar, FiClock, FiGrid, FiLayers, FiUsers, FiToggleRight } from 'react-icons/fi'
import { PageHeader } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { ACADEMIC_HUB_GROUPS } from '@/config/academicDefinitions'
import { HubPageShell, HubSectionTitle, HubLinkCard, HubTileCard } from '@/components/hub/HubWidgets'

const groupIcons = {
  'Academic Setup': FiBook,
  Curriculum: FiLayers,
  'Class Allocation': FiUsers,
  'Calendar & Timetable Foundation': FiCalendar,
  'Assessment & Policies Foundation': FiBook,
}

export default function AcademicsHubPage() {
  return (
    <HubPageShell>
      <Breadcrumb items={[{ label: 'Academic Structure' }]} />
      <PageHeader
        title="Academic Structure"
        subtitle="School-year operations: activate classes, curriculum mapping, calendar, and assessment rules. Organization catalogs (boards, subjects, STD/section setup) live under Masters Hub."
        actions={
          <Link
            to="/masters"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <FiLayers className="h-4 w-4" /> Masters Hub
          </Link>
        }
      />

      <div className="space-y-8">
        <div>
          <HubSectionTitle
            icon={FiToggleRight}
            title="Year Class Activation"
            subtitle="Create standards, sections, and maps in Masters Hub first — then activate them here for the academic year."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <HubLinkCard
              to="/academics/class-sections"
              icon={FiToggleRight}
              label="Active / Inactive Classes"
              description="Enable or disable mapped class sections for the selected academic year."
            />
          </div>
        </div>

        {ACADEMIC_HUB_GROUPS.map((group) => {
          const Icon = groupIcons[group.title] || FiGrid
          const sectionSubtitle =
            group.title === 'Academic Setup'
              ? 'Academic years are configured in Admissions → Setup. View them here; edit there.'
              : group.title === 'Curriculum'
                ? 'Define subject lists per board/stream under Masters Hub before building curriculum here.'
                : undefined
          return (
            <div key={group.title}>
              <HubSectionTitle icon={Icon} title={group.title} subtitle={sectionSubtitle} />
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
