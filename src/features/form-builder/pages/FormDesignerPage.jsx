import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import FormDesigner from '../components/FormDesigner'
import { getFormById } from '../services/formStorage'

export default function FormDesignerPage() {
  const { id } = useParams()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    ;(async () => {
      setLoading(true)
      const row = await getFormById(id)
      if (active) {
        setForm(row)
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Loading form…
      </div>
    )
  }

  if (!form) {
    return <Navigate to="/form-builder" replace />
  }

  return <FormDesigner key={form.id} form={form} />
}
