import { Navigate } from 'react-router-dom'

/** Legacy route — create now starts from the name popup on the list page. */
export default function FormBuilderNewPage() {
  return <Navigate to="/form-builder" replace />
}
