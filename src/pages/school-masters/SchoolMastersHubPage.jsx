import { Link } from 'react-router-dom'
import {
  FiHeart, FiUsers, FiTruck, FiHome, FiAward, FiActivity, FiGlobe, FiTag,
} from 'react-icons/fi'
import { PageHeader } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import { SCHOOL_MASTER_DEFINITIONS, SCHOOL_MASTER_GROUPS } from '@/config/schoolMasterDefinitions'
import { HubPageShell, HubSectionTitle, HubTileCard } from '@/components/hub/HubWidgets'

const ICONS = {
  religion: FiHeart,
  caste: FiUsers,
  category: FiTag,
  blood_group: FiActivity,
  gender: FiUsers,
  nationality: FiGlobe,
  mother_tongue: FiGlobe,
  occupation: FiUsers,
  relationship: FiUsers,
  transport_route: FiTruck,
  pickup_point: FiTruck,
  vehicle_type: FiTruck,
  department: FiUsers,
  designation: FiUsers,
  house: FiHome,
  club: FiAward,
  skill: FiAward,
  achievement: FiAward,
  disability: FiActivity,
  medical_condition: FiHeart,
}

export default function SchoolMastersHubPage() {
  return (
    <HubPageShell>
      <Breadcrumb items={[{ label: 'School Masters' }]} />
      <PageHeader
        title="School Master Management"
        subtitle="Configure lookup values per school — religion, gender, transport routes, departments, and more"
      />

      <div className="space-y-8">
        {SCHOOL_MASTER_GROUPS.map((group) => (
          <div key={group.title}>
            <HubSectionTitle title={group.title} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {group.keys.map((key) => {
                const def = SCHOOL_MASTER_DEFINITIONS[key]
                const Icon = ICONS[key] || FiTag
                return (
                  <HubTileCard key={key} to={`/school-masters/${key}`} icon={Icon} label={def.labelPlural} />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </HubPageShell>
  )
}
