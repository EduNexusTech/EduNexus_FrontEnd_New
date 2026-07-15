import { Navigate, useParams } from 'react-router-dom'
import FormDesigner from '../components/FormDesigner'
import { getFormById } from '../services/formStorage'

export default function FormDesignerPage() {
  const { id } = useParams()
  const form = getFormById(id)

  // Do not auto-create here — that caused duplicate entries on remount/save.
  // Forms are only created from the name popup on the list page.
  if (!form) {
    return <Navigate to="/form-builder" replace />
  }

  return <FormDesigner key={form.id} form={form} />
}
