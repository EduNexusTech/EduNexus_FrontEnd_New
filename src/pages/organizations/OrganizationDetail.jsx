import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiArrowLeft,
  FiBriefcase,
  FiCalendar,
  FiEdit2,
  FiExternalLink,
  FiFileText,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPower,
} from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import { PageLoader, ErrorState, StatusBadge } from '@/components/ui/Feedback'
import { organizationService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { formatDateTime, resolveMediaUrl } from '@/utils/format'
import { OrganizationDocumentsList } from './OrganizationDocumentsModal'

function InfoItem({ icon: Icon, label, value, href, external }) {
  const empty = value == null || value === ''
  const content = empty ? '—' : value

  return (
    <div className="flex min-w-0 gap-3 rounded-2xl border border-[var(--clay-glass-edge)] bg-white/80 px-4 py-3.5">
      <div className="clay-icon-3d flex h-10 w-10 shrink-0 items-center justify-center text-[var(--btn-edit)]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--clay-primary-soft)]">{label}</p>
        {href && !empty ? (
          <a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className="mt-1 inline-flex max-w-full items-center gap-1.5 truncate text-sm font-semibold text-[var(--btn-edit)] hover:underline"
          >
            <span className="truncate">{content}</span>
            {external ? <FiExternalLink className="h-3.5 w-3.5 shrink-0" /> : null}
          </a>
        ) : (
          <p className="mt-1 break-words text-sm font-semibold text-[var(--clay-text-sharp)]">{content}</p>
        )}
      </div>
    </div>
  )
}

function SectionCard({ title, subtitle, icon: Icon, action, children, className = '' }) {
  return (
    <section className={`clay-card clay-card-white min-w-0 p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {Icon ? (
            <div className="clay-icon-3d flex h-10 w-10 shrink-0 items-center justify-center text-[var(--btn-edit)]">
              <Icon className="h-4 w-4" />
            </div>
          ) : null}
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[var(--clay-text-sharp)]">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-sm text-[var(--clay-primary-soft)]">{subtitle}</p> : null}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'ORG'
  )
}

export default function OrganizationDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['organizations', id],
    queryFn: () => organizationService.get(id),
  })
  const organization = unwrapData(data)

  const activateMutation = useMutation({
    mutationFn: () => organizationService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization activated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  const deactivateMutation = useMutation({
    mutationFn: () => organizationService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization deactivated')
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  })

  if (isLoading) return <PageLoader />
  if (error) return <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
  if (!organization) return <ErrorState message="Organization not found" onRetry={refetch} />

  const name = organization.organization_name || 'Organization'
  const code = organization.organization_code
  const logoUrl = resolveMediaUrl(organization.logo)
  const website = organization.website
  const websiteHref = website
    ? website.startsWith('http')
      ? website
      : `https://${website}`
    : null
  const location = [organization.city, organization.state, organization.country].filter(Boolean).join(', ')
  const documents = organization.documents || []
  const toggling = activateMutation.isPending || deactivateMutation.isPending

  return (
    <div className="lms-page w-full min-w-0 max-w-full space-y-5 pb-6">
      <Breadcrumb
        items={[
          { label: 'Organizations', href: '/organizations' },
          { label: name },
        ]}
      />

      {/* Hero */}
      <section className="clay-card clay-card-white relative overflow-hidden p-0">
        <div
          className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-[#2563eb]/12 via-[#0ea5e9]/08 to-[#7c3aed]/10"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name}
                className="h-20 w-20 shrink-0 rounded-2xl border border-white object-cover shadow-md ring-1 ring-[var(--clay-glass-edge)] sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#0ea5e9] text-xl font-extrabold text-white shadow-md sm:h-24 sm:w-24 sm:text-2xl">
                {initials(name)}
              </div>
            )}

            <div className="min-w-0 pt-2 sm:pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-[var(--clay-text-sharp)] sm:text-3xl">
                  {name}
                </h1>
                <StatusBadge active={organization.is_active} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--clay-primary-soft)]">
                {code ? (
                  <span className="inline-flex items-center rounded-lg border border-[var(--clay-glass-edge)] bg-[#eff6ff] px-2.5 py-1 text-xs font-bold text-[#1d4ed8]">
                    {code}
                  </span>
                ) : null}
                {location ? (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{location}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button variant="back" size="sm" onClick={() => window.history.back()}>
              <FiArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Link to={`/organizations/${id}/edit`}>
              <Button variant="edit" size="sm">
                <FiEdit2 className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            {organization.is_active ? (
              <Button
                variant="danger"
                size="sm"
                loading={toggling}
                onClick={() => deactivateMutation.mutate()}
              >
                <FiPower className="h-4 w-4" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="success"
                size="sm"
                loading={toggling}
                onClick={() => activateMutation.mutate()}
              >
                <FiPower className="h-4 w-4" />
                Activate
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <div className="lms-grid-hub-stats">
        <div className="clay-card clay-card-glass-teal min-w-0 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--clay-primary-soft)]">Status</p>
          <p className="mt-2 text-lg font-extrabold text-[var(--clay-text-sharp)]">
            {organization.is_active ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="clay-card clay-card-green min-w-0 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--clay-primary-soft)]">Documents</p>
          <p className="mt-2 text-lg font-extrabold text-[var(--clay-text-sharp)]">{documents.length}</p>
        </div>
        <div className="clay-card clay-card-glass-forest min-w-0 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--clay-primary-soft)]">Created</p>
          <p className="mt-2 text-sm font-bold text-[var(--clay-text-sharp)]">
            {organization.created_at ? formatDateTime(organization.created_at) : '—'}
          </p>
        </div>
        <div className="clay-card clay-card-white min-w-0 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--clay-primary-soft)]">Last updated</p>
          <p className="mt-2 text-sm font-bold text-[var(--clay-text-sharp)]">
            {organization.updated_at ? formatDateTime(organization.updated_at) : '—'}
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-5 min-w-0">
          <SectionCard
            title="Contact information"
            subtitle="Primary ways to reach this organization"
            icon={FiMail}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={FiMail}
                label="Email"
                value={organization.email}
                href={organization.email ? `mailto:${organization.email}` : undefined}
              />
              <InfoItem
                icon={FiPhone}
                label="Phone"
                value={organization.phone}
                href={organization.phone ? `tel:${organization.phone}` : undefined}
              />
              <InfoItem
                icon={FiGlobe}
                label="Website"
                value={website}
                href={websiteHref}
                external
              />
              <InfoItem icon={FiBriefcase} label="Organization code" value={code} />
            </div>
          </SectionCard>

          <SectionCard
            title="Address & location"
            subtitle="Registered address details"
            icon={FiMapPin}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <InfoItem icon={FiMapPin} label="Street address" value={organization.address} />
              </div>
              <InfoItem icon={FiMapPin} label="City" value={organization.city} />
              <InfoItem icon={FiMapPin} label="State / Province" value={organization.state} />
              <InfoItem icon={FiGlobe} label="Country" value={organization.country} />
              <InfoItem
                icon={FiMapPin}
                label="Postal code"
                value={organization.postal_code || organization.zip_code || organization.pincode}
              />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5 min-w-0">
          <SectionCard
            title="Documents"
            subtitle="Uploaded files for this organization"
            icon={FiFileText}
            action={
              <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-xs font-bold text-[#1d4ed8]">
                {documents.length} file{documents.length === 1 ? '' : 's'}
              </span>
            }
          >
            <OrganizationDocumentsList
              documents={documents}
              allowDownload
              emptyMessage="No documents uploaded for this organization yet."
            />
          </SectionCard>

          <SectionCard title="Timeline" subtitle="Record activity" icon={FiCalendar}>
            <ul className="space-y-3">
              <li className="flex gap-3 rounded-2xl border border-[var(--clay-glass-edge)] bg-[#f8fafc] px-4 py-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#16a34a]" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--clay-text-sharp)]">Created</p>
                  <p className="mt-0.5 text-xs text-[var(--clay-primary-soft)]">
                    {organization.created_at ? formatDateTime(organization.created_at) : 'Not available'}
                  </p>
                </div>
              </li>
              <li className="flex gap-3 rounded-2xl border border-[var(--clay-glass-edge)] bg-[#f8fafc] px-4 py-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2563eb]" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--clay-text-sharp)]">Last updated</p>
                  <p className="mt-0.5 text-xs text-[var(--clay-primary-soft)]">
                    {organization.updated_at ? formatDateTime(organization.updated_at) : 'Not available'}
                  </p>
                </div>
              </li>
              <li className="flex gap-3 rounded-2xl border border-[var(--clay-glass-edge)] bg-[#f8fafc] px-4 py-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    organization.is_active ? 'bg-[#16a34a]' : 'bg-[#94a3b8]'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--clay-text-sharp)]">Current status</p>
                  <p className="mt-0.5 text-xs text-[var(--clay-primary-soft)]">
                    {organization.is_active
                      ? 'This organization is active and available across the platform.'
                      : 'This organization is currently deactivated.'}
                  </p>
                </div>
              </li>
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
