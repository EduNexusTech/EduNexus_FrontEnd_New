import { Link } from 'react-router-dom'
import { FiBook, FiCalendar, FiClock, FiGrid, FiLayers, FiUsers } from 'react-icons/fi'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { ACADEMIC_HUB_GROUPS } from '@/config/academicDefinitions'

const groupIcons = {
  'Academic Setup': FiBook,
  Curriculum: FiLayers,
  'Class Allocation': FiUsers,
  'Calendar & Timetable': FiCalendar,
}

export default function AcademicsHubPage() {
  return (
    <div className="w-full">
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
              <div className="mb-4 flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{group.title}</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((item) => (
                  <Link key={item.key} to={item.path}>
                    <Card hover className="flex items-center gap-4">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        {item.key.includes('timing') || item.key === 'periods' ? (
                          <FiClock className="h-6 w-6" />
                        ) : (
                          <Icon className="h-6 w-6" />
                        )}
                      </div>
                      <span className="font-semibold">{item.label}</span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
