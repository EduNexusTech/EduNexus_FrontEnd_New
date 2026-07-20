import { Link } from 'react-router-dom'
import { FiGlobe, FiMap, FiMapPin, FiBook, FiLayers, FiGrid, FiUsers, FiTag } from 'react-icons/fi'
import { PageHeader } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { HubPageShell, HubSectionTitle, HubTileCard } from '@/components/hub/HubWidgets'

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
      { key: 'academic-years', label: 'Academic Years', icon: FiBook, path: '/academics/academic-years' },
      { key: 'boards', label: 'Boards', icon: FiLayers, path: '/masters/boards' },
      { key: 'classes', label: 'Classes', icon: FiGrid, path: '/masters/classes' },
      { key: 'sections', label: 'Sections', icon: FiGrid, path: '/masters/sections' },
      { key: 'streams', label: 'Streams', icon: FiLayers, path: '/masters/streams' },
      { key: 'subjects', label: 'Subjects', icon: FiBook, path: '/masters/subjects' },
      { key: 'subject-groups', label: 'Subject Groups', icon: FiLayers, path: '/masters/subject-groups' },
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
    <HubPageShell>
      <Breadcrumb items={[{ label: 'Masters' }]} />
      <PageHeader
        title="Master Data"
        subtitle="Organization reference data — adopt platform boards via MDM, then manage local catalogs"
      />

      <div className="mb-8">
        <HubSectionTitle title="MDM" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <HubTileCard to="/mdm" icon={FiLayers} label="Platform Catalog & Adopt" />
        </div>
      </div>

      <div className="space-y-8">
        {masterGroups.map((group) => (
          <div key={group.title}>
            <HubSectionTitle title={group.title} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {group.items.map((item) => (
                <HubTileCard key={item.key} to={item.path} icon={item.icon} label={item.label} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </HubPageShell>
  )
}
