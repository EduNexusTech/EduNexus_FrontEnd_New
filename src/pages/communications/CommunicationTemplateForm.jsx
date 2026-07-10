import ResourceFormPage from '@/components/crud/ResourceFormPage'
import { communicationService } from '@/api/services'
import {
  COMMUNICATION_CHANNEL_OPTIONS,
  COMMUNICATION_TEMPLATE_CATEGORY_OPTIONS,
} from '@/config/constants'

const fields = [
  { name: 'name', label: 'Template Name', type: 'text', required: true },
  { name: 'code', label: 'Code', type: 'text', help: 'Unique code per school' },
  { name: 'category', label: 'Category', type: 'select', options: COMMUNICATION_TEMPLATE_CATEGORY_OPTIONS },
  { name: 'channel', label: 'Primary Channel', type: 'select', options: COMMUNICATION_CHANNEL_OPTIONS },
  { name: 'subject_template', label: 'Subject Template', type: 'text', fullWidth: true },
  { name: 'body_template', label: 'Body Template', type: 'textarea', fullWidth: true, required: true },
  { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
]

export default function CommunicationTemplateForm() {
  return (
    <ResourceFormPage
      title="Communication Template"
      queryKey="communication-templates"
      getFn={communicationService.templates.get}
      createFn={communicationService.templates.create}
      updateFn={communicationService.templates.update}
      basePath="/communications/templates"
      fields={fields}
      breadcrumb={[
        { label: 'Communications', href: '/communications' },
        { label: 'Templates', href: '/communications/templates' },
      ]}
    />
  )
}
