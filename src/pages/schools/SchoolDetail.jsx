import { Link, useParams } from 'react-router-dom'
import { ResourceDetailPage } from '@/components/crud/ResourceFormPage'
import { schoolService } from '@/api/services'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Feedback'

export default function SchoolDetail() {
  const { id } = useParams()
  return (
    <ResourceDetailPage
      title="School"
      queryKey="schools"
      getFn={schoolService.get}
      basePath="/schools"
      fields={[
        { key: 'school_name', label: 'Name' },
        { key: 'school_code', label: 'Code' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'organization_name', label: 'Organization' },
        { key: 'address', label: 'Address' },
        { key: 'timezone', label: 'Timezone' },
        { key: 'currency', label: 'Currency' },
        { key: 'status', label: 'Status' },
        { key: 'is_active', label: 'Active', render: (item) => <StatusBadge active={item.is_active} /> },
      ]}
      actions={() => (
        <>
          <Link to={`/schools/${id}/profile`}><Button variant="outline">School Profile</Button></Link>
          <Link to={`/schools/${id}/edit`}><Button variant="edit">Edit</Button></Link>
        </>
      )}
    />
  )
}
