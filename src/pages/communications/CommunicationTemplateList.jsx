import ResourceListPage from '@/components/crud/ResourceListPage'
import { communicationService } from '@/api/services'

const columns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'code', header: 'Code' },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'channel', header: 'Channel' },
  { accessorKey: 'school_name', header: 'School' },
]

export default function CommunicationTemplateList() {
  return (
    <ResourceListPage
      title="Communication Templates"
      subtitle="Reusable templates for email, SMS, WhatsApp, and push"
      queryKey="communication-templates"
      listFn={communicationService.templates.list}
      deleteFn={communicationService.templates.delete}
      basePath="/communications/templates"
      columns={columns}
    />
  )
}
