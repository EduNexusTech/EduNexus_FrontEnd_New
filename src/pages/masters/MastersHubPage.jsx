import { Link } from 'react-router-dom'
import { FiGlobe, FiMap, FiMapPin, FiBook, FiLayers, FiGrid, FiUsers, FiTag } from 'react-icons/fi'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'

const masterGroups = [
  {
    title: 'Locations',
    items: [
      { key: 'countries', label: 'Countries', icon: FiGlobe, path: '/masters/countries' },
      { key: 'states', label: 'States', icon: FiMap, path: '/masters/states' },
      { key: 'cities', label: 'Cities', icon: FiMapPin, path: '/masters/cities' },
    ],
  },
  {
    title: 'Academic',
    items: [
      { key: 'academic-years', label: 'Academic Years', icon: FiBook, path: '/masters/academic-years' },
      { key: 'boards', label: 'Boards', icon: FiLayers, path: '/masters/boards' },
      { key: 'classes', label: 'Classes', icon: FiGrid, path: '/masters/classes' },
      { key: 'sections', label: 'Sections', icon: FiGrid, path: '/masters/sections' },
      { key: 'subjects', label: 'Subjects', icon: FiBook, path: '/masters/subjects' },
    ],
  },
  {
    title: 'Staff',
    items: [
      { key: 'departments', label: 'Departments', icon: FiUsers, path: '/masters/departments' },
      { key: 'designations', label: 'Designations', icon: FiUsers, path: '/masters/designations' },
    ],
  },
  {
    title: 'General',
    items: [
      { key: 'categories', label: 'Categories', icon: FiTag, path: '/masters/categories' },
    ],
  },
]

export default function MastersHubPage() {
  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'Masters' }]} />
      <PageHeader title="Master Data" subtitle="Manage reference data for your organization" />

      <div className="space-y-8">
        {masterGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-lg font-semibold mb-4">{group.title}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {group.items.map((item) => (
                <Link key={item.key} to={item.path}>
                  <Card hover className="flex items-center gap-4">
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="font-semibold">{item.label}</span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
