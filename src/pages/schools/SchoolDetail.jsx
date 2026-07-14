import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ResourceDetailPage } from '@/components/crud/ResourceFormPage'
import { schoolService } from '@/api/services'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Feedback'
import { unwrapData } from '@/api/client'
import { SchoolDocumentsList } from './SchoolDocumentsModal'

export default function SchoolDetail() {
  const { id } = useParams()

  const { data } = useQuery({
    queryKey: ['schools', id],
    queryFn: () => schoolService.get(id),
  })
  const school = unwrapData(data)

  return (
    <div className="space-y-6">
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

      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">Documents</h2>
            <p className="text-sm text-muted">Download uploaded school files</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">
            {(school?.documents || []).length}
          </span>
        </div>
        <SchoolDocumentsList
          documents={school?.documents || []}
          allowDownload
          emptyMessage="No documents uploaded for this school."
        />
      </div>
    </div>
  )
}
