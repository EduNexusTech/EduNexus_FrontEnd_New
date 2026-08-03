import { FiGlobe, FiMap, FiMapPin, FiBook, FiLayers, FiGrid, FiUsers, FiTag, FiLink } from 'react-icons/fi'
import { PageHeader } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { useAuth } from '@/contexts/AuthContext'
import { HubPageShell, HubSectionTitle, HubTileCard, HubLinkCard } from '@/components/hub/HubWidgets'

const masterGroups = [
  {
    title: 'Locations',
    superAdminOnly: true,
    subtitle: 'Organization-wide reference data — managed by super admin only.',
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
  const { isSuperAdmin } = useAuth()

  const visibleGroups = masterGroups.filter((group) => !group.superAdminOnly || isSuperAdmin)

  return (
    <HubPageShell>
      <Breadcrumb items={[{ label: 'Masters' }]} />
      <PageHeader
        title="Masters Hub"
        subtitle="Organization catalog, school class setup (STD / section / map), and MDM. Countries, states, and cities are shared org-wide and managed by super admin. Year-specific setup is under Academic Structure."
      />

      <div className="mb-8">
        <HubSectionTitle title="School Class Setup" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <HubLinkCard to="/masters/setup/standards" icon={FiGrid} label="Standards" />
          <HubLinkCard to="/masters/setup/sections" icon={FiLayers} label="Sections" />
          <HubLinkCard to="/masters/setup/map" icon={FiLink} label="Map" />
        </div>
      </div>

      <div className="mb-8">
        <HubSectionTitle title="MDM" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <HubTileCard to="/mdm" icon={FiLayers} label="Platform Catalog & Adopt" />
        </div>
      </div>

      <div className="space-y-8">
        {visibleGroups.map((group) => (
          <div key={group.title}>
            <HubSectionTitle title={group.title} subtitle={group.subtitle} />
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
