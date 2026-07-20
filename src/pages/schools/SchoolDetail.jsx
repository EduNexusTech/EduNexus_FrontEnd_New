import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ResourceDetailPage } from '@/components/crud/ResourceFormPage'
import { schoolService } from '@/api/services'
import Button from '@/components/ui/Button'
import { StatusBadge, PageLoader } from '@/components/ui/Feedback'
import { Card } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { getErrorMessage, unwrapData } from '@/api/client'
import { SchoolDocumentsList } from './SchoolDocumentsModal'

const FEATURE_LABELS = {
  enable_admissions: 'Admissions',
  enable_attendance: 'Attendance',
  enable_lms: 'LMS',
  enable_payroll: 'Payroll',
  enable_transport: 'Transport',
  enable_library: 'Library',
  enable_hostel: 'Hostel',
  enable_ai: 'AI',
  enable_inventory: 'Inventory',
  enable_communication: 'Communication',
  enable_online_exams: 'Online Exams',
  enable_student_app: 'Student App',
  enable_teacher_app: 'Teacher App',
  enable_parent_app: 'Parent App',
  enable_biometric: 'Biometric',
  enable_whatsapp: 'WhatsApp',
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-slate-50/70 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold text-text">{value ?? 0}</p>
    </div>
  )
}

export default function SchoolDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [cloneName, setCloneName] = useState('')
  const [cloneCode, setCloneCode] = useState('')

  const { data } = useQuery({
    queryKey: ['schools', id],
    queryFn: () => schoolService.get(id),
  })
  const school = unwrapData(data)

  const overviewQuery = useQuery({
    queryKey: ['schools', id, 'saas-overview'],
    queryFn: () => schoolService.getSaasOverview(id),
    enabled: Boolean(id),
  })
  const overview = unwrapData(overviewQuery.data)

  const featureMutation = useMutation({
    mutationFn: ({ feature, enabled }) => schoolService.setFeature(id, { feature, enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools', id, 'saas-overview'] })
      toast.success('Feature updated')
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update feature')),
  })

  const brandingMutation = useMutation({
    mutationFn: (payload) => schoolService.updateBranding(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools', id, 'saas-overview'] })
      toast.success('Branding saved')
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to save branding')),
  })

  const lifecycleMutation = useMutation({
    mutationFn: (action) => schoolService[action](id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      queryClient.invalidateQueries({ queryKey: ['schools', id] })
      toast.success('School status updated')
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Failed to update status')),
  })

  const cloneMutation = useMutation({
    mutationFn: () => schoolService.clone(id, { school_name: cloneName, school_code: cloneCode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schools'] })
      toast.success('School configuration cloned')
      setCloneName('')
      setCloneCode('')
    },
    onError: (err) => toast.error(getErrorMessage(err, 'Clone failed')),
  })

  const features = useMemo(() => overview?.features || {}, [overview])
  const branding = overview?.branding || {}
  const analytics = overview?.analytics || {}

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
          { key: 'short_name', label: 'Short Name' },
          { key: 'legal_name', label: 'Legal Name' },
          { key: 'school_type_display', label: 'Type' },
          { key: 'medium_display', label: 'Medium' },
          { key: 'school_category_display', label: 'Category' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'alternate_phone', label: 'Alternate Phone' },
          { key: 'principal_name', label: 'Principal' },
          { key: 'vice_principal_name', label: 'Vice Principal' },
          { key: 'organization_name', label: 'Organization' },
          { key: 'address', label: 'Address' },
          { key: 'motto', label: 'Motto' },
          { key: 'timezone', label: 'Timezone' },
          { key: 'currency', label: 'Currency' },
          { key: 'status', label: 'Status' },
          { key: 'is_active', label: 'Active', render: (item) => <StatusBadge active={item.is_active} /> },
        ]}
        actions={() => (
          <>
            <Button
              variant="outline"
              onClick={() => lifecycleMutation.mutate('activate')}
              disabled={lifecycleMutation.isPending}
            >
              Activate
            </Button>
            <Button
              variant="outline"
              onClick={() => lifecycleMutation.mutate('suspend')}
              disabled={lifecycleMutation.isPending}
            >
              Suspend
            </Button>
            <Link to={`/schools/${id}/profile`}><Button variant="outline">School Profile</Button></Link>
            <Link to={`/schools/${id}/edit`}><Button variant="edit">Edit</Button></Link>
          </>
        )}
      />

      {overviewQuery.isLoading ? (
        <PageLoader />
      ) : (
        <>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text">Analytics</h2>
            <p className="mt-1 text-sm text-muted">Operational snapshot for this school</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Students" value={analytics.students_count} />
              <Metric label="Teachers" value={analytics.teachers_count} />
              <Metric label="Staff Assignments" value={analytics.staff_assignments} />
              <Metric label="Documents" value={analytics.documents_count} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text">Branding</h2>
            <p className="mt-1 text-sm text-muted">Override organization branding for this school</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                label="Primary Color"
                defaultValue={branding.primary_color || ''}
                onBlur={(e) => brandingMutation.mutate({ primary_color: e.target.value })}
              />
              <Input
                label="Secondary Color"
                defaultValue={branding.secondary_color || ''}
                onBlur={(e) => brandingMutation.mutate({ secondary_color: e.target.value })}
              />
              <Input
                label="Theme"
                defaultValue={branding.theme || 'light'}
                onBlur={(e) => brandingMutation.mutate({ theme: e.target.value })}
              />
              <label className="flex items-end gap-2 pb-2 text-sm text-text">
                <input
                  type="checkbox"
                  defaultChecked={Boolean(branding.inherit_organization_branding)}
                  onChange={(e) => brandingMutation.mutate({ inherit_organization_branding: e.target.checked })}
                />
                Inherit organization branding
              </label>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text">Feature Flags</h2>
            <p className="mt-1 text-sm text-muted">Enable or disable modules for this school only</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {Object.keys(FEATURE_LABELS).map((key) => (
                <label key={key} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(features[key])}
                    disabled={featureMutation.isPending}
                    onChange={(e) => featureMutation.mutate({ feature: key, enabled: e.target.checked })}
                  />
                  {FEATURE_LABELS[key]}
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-text">Clone Configuration</h2>
            <p className="mt-1 text-sm text-muted">Create a new school copying branding, timings, and settings</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input label="New School Name" value={cloneName} onChange={(e) => setCloneName(e.target.value)} />
              <Input label="New School Code" value={cloneCode} onChange={(e) => setCloneCode(e.target.value)} />
            </div>
            <div className="mt-4">
              <Button
                onClick={() => cloneMutation.mutate()}
                disabled={!cloneName || !cloneCode || cloneMutation.isPending}
              >
                Clone School
              </Button>
            </div>
          </Card>
        </>
      )}

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
