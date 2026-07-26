import { FiGlobe, FiMap, FiMapPin, FiBook, FiLayers, FiGrid, FiUsers, FiTag, FiLink } from 'react-icons/fi'
import { PageHeader } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { HubPageShell, HubSectionTitle, HubTileCard, HubLinkCard } from '@/components/hub/HubWidgets'

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
    title: 'Other Academic Catalog',
    items: [
      { key: 'boards', label: 'Boards', icon: FiLayers, path: '/masters/boards' },
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
        subtitle="Create school standards & sections here, then activate them for a year under Academic Structure"
      />

      <div className="mb-8">
        <HubSectionTitle
          title="School Class Setup"
          subtitle="Use school ID flow: Standards → Sections → Map. Activate for the year in Academics."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <HubLinkCard
            to="/masters/setup/standards"
            icon={FiGrid}
            label="Standards (STD)"
            description="Create standards / classes by school. No academic year required."
          />
          <HubLinkCard
            to="/masters/setup/sections"
            icon={FiLayers}
            label="Sections"
            description="Create section labels (A, B, C…) by school, independent of standards."
          />
          <HubLinkCard
            to="/masters/setup/map"
            icon={FiLink}
            label="Map"
            description="Map sections to standards for a school year (created inactive until activated)."
          />
        </div>
      </div>

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
