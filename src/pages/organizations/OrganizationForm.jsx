import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiGlobe,
  FiHome,
  FiImage,
  FiLayers,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiUpload,
  FiX,
} from 'react-icons/fi'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import Input, { Textarea } from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { organizationService, schoolService } from '@/api/services'
import { getErrorMessage, unwrapData, unwrapList } from '@/api/client'
import { cn, getInitials, resolveMediaUrl } from '@/utils/format'

const LOGO_MAX_BYTES = 2 * 1024 * 1024
const LOGO_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'

const STEPS = [
  { id: 'identity', label: 'Identity', icon: FiHome, description: 'Name, code, and logo' },
  { id: 'contact', label: 'Contact', icon: FiMail, description: 'How to reach the organization' },
  { id: 'location', label: 'Location', icon: FiMapPin, description: 'Physical address details' },
  { id: 'review', label: 'Review', icon: FiCheck, description: 'Confirm and create' },
]

const STEP_FIELDS = {
  identity: ['organization_name', 'organization_code'],
  contact: ['email', 'phone', 'website'],
  location: ['address', 'city', 'state', 'country'],
}

const DEFAULT_VALUES = {
  organization_name: '',
  organization_code: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  state: '',
  country: '',
}

function buildOrganizationPayload(values, logoFile) {
  if (logoFile) {
    const fd = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        fd.append(key, value)
      }
    })
    fd.append('logo', logoFile)
    return fd
  }
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  )
}

function buildSchoolAddress(values) {
  return [values.address, values.city, values.state, values.country].filter(Boolean).join(', ')
}

async function resolveCreatedOrganizationId(orgResponse, organizationCode) {
  const org = unwrapData(orgResponse)
  const directId = org?.organization_id || org?.id
  if (directId) return directId

  const code = org?.organization_code || organizationCode
  if (!code) return null

  const listResponse = await organizationService.list({
    search: code,
    page_size: 50,
    ordering: '-created_at',
  })
  const { results } = unwrapList(listResponse)
  const match = results.find((item) => item.organization_code === code)
  return match?.organization_id || match?.id || null
}

function buildSchoolPayloadFromOrganization(values, organizationId, logoFile) {
  const payload = {
    organization_id: organizationId,
    school_name: values.organization_name,
    school_code: values.organization_code,
    academic_start_month: 4,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    status: 'active',
  }

  if (values.email) payload.email = values.email
  if (values.phone) payload.phone = values.phone
  if (values.website) payload.website = values.website

  const address = buildSchoolAddress(values)
  if (address) payload.address = address

  if (logoFile) {
    const fd = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        fd.append(key, value)
      }
    })
    fd.append('logo', logoFile)
    return fd
  }

  return payload
}

function buildSchoolUpdatePayloadFromOrganization(values, logoFile) {
  const payload = {
    school_name: values.organization_name,
  }

  if (values.email) payload.email = values.email
  if (values.phone) payload.phone = values.phone
  if (values.website) payload.website = values.website

  const address = buildSchoolAddress(values)
  if (address) payload.address = address

  if (logoFile) {
    const fd = new FormData()
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        fd.append(key, value)
      }
    })
    fd.append('logo', logoFile)
    return fd
  }

  return payload
}

async function findMatchingSchool(organizationId, schoolCode) {
  const listResponse = await schoolService.list({
    organization: organizationId,
    page_size: 100,
  })
  const { results } = unwrapList(listResponse)
  return results.find((school) => school.school_code === schoolCode) || null
}

async function upsertSchoolFromOrganization(formData, organizationId, logoFile) {
  const existing = await findMatchingSchool(organizationId, formData.organization_code)

  if (existing) {
    const schoolId = existing.school_id || existing.id
    await schoolService.update(schoolId, buildSchoolUpdatePayloadFromOrganization(formData, logoFile))
    return 'updated'
  }

  await schoolService.create(buildSchoolPayloadFromOrganization(formData, organizationId, logoFile))
  return 'created'
}

function slugifyOrgCode(name) {
  const slug = (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 49)

  if (!slug) return ''
  return /^[a-z]/.test(slug) ? slug : `org_${slug}`
}

function LogoUpload({ previewUrl, onSelect, onClear, error, hint }) {
  const inputRef = useRef(null)

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text">Organization Logo</label>
      <div className="flex flex-col gap-4 rounded-xl border border-dashed border-border bg-slate-50/50 p-4 sm:flex-row sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-white">
          {previewUrl ? (
            <img src={previewUrl} alt="Logo preview" className="h-full w-full object-cover" />
          ) : (
            <FiImage className="h-8 w-8 text-muted" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <p className="text-sm text-muted">
            {hint || 'PNG, JPG, WebP or GIF. Max 2 MB.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              <FiUpload className="h-4 w-4" />
              {previewUrl ? 'Change logo' : 'Upload logo'}
            </Button>
            {previewUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={onClear}>
                Remove
              </Button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={LOGO_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onSelect(file)
              e.target.value = ''
            }}
          />
        </div>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

function HorizontalSteps({ steps, current, onStepClick, isEdit }) {
  const currentIndex = steps.findIndex((s) => s.id === current)

  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isActive = step.id === current
        const isComplete = currentIndex > index
        const clickable = isEdit || isComplete || isActive

        return (
          <button
            key={step.id}
            type="button"
            disabled={!clickable}
            onClick={() => clickable && onStepClick?.(step.id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition',
              isActive && 'border-primary/30 bg-primary/8 text-primary',
              isComplete && !isActive && 'border-success/30 bg-success/5 text-success',
              !isActive && !isComplete && 'border-border bg-white text-muted',
              clickable && !isActive && 'hover:border-primary/20 hover:bg-slate-50',
              !clickable && 'cursor-default opacity-60',
            )}
          >
            <span className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg',
              isActive && 'gradient-primary text-white',
              isComplete && !isActive && 'bg-success/15',
              !isActive && !isComplete && 'bg-slate-100',
            )}>
              {isComplete ? <FiCheck className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
            </span>
            {step.label}
          </button>
        )
      })}
    </div>
  )
}

function SchoolMatchToggle({ enabled, onToggle, values, isEdit, hasExistingSchool }) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-start gap-4 rounded-xl border p-4 text-left transition',
          enabled
            ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20'
            : 'border-border bg-white hover:border-primary/20 hover:bg-slate-50',
        )}
      >
        <span
          className={cn(
            'mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            enabled ? 'gradient-primary text-white' : 'bg-slate-100 text-muted',
          )}
        >
          <FiLayers className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-text">Organization details are same for school</span>
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                enabled ? 'bg-primary/15 text-primary' : 'bg-slate-100 text-muted',
              )}
            >
              {enabled ? 'Enabled' : 'Optional'}
            </span>
          </span>
          <span className="mt-1 block text-sm text-muted">
            {isEdit
              ? hasExistingSchool
                ? 'Update the matching school with the same name, contact details, logo, and address.'
                : 'Create a school under this organization using the same details — useful if you forgot during setup.'
              : 'Create a school under this organization using the same name, code, contact details, logo, and address.'}
          </span>
        </span>
        <span
          className={cn(
            'mt-1 flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition',
            enabled ? 'bg-primary' : 'bg-slate-200',
          )}
        >
          <span
            className={cn(
              'h-5 w-5 rounded-full bg-white shadow transition-transform',
              enabled && 'translate-x-5',
            )}
          />
        </span>
      </button>

      {enabled && (
        <div className="rounded-xl border border-success/20 bg-success/5 px-4 py-3 text-sm text-success">
          {isEdit && hasExistingSchool ? (
            <>
              Matching school <strong>{values.organization_name || '—'}</strong> will be updated with these organization details.
            </>
          ) : (
            <>
              A school named <strong>{values.organization_name || '—'}</strong> with code{' '}
              <strong className="font-mono">{values.organization_code || '—'}</strong> will be{' '}
              {isEdit ? 'created' : 'created automatically'}.
            </>
          )}
        </div>
      )}
    </div>
  )
}

function FormActions({
  isEdit,
  step,
  isPending,
  createMatchingSchool,
  onCancel,
  onReset,
  onBack,
  onNext,
}) {
  const submitLabel = isEdit
    ? (createMatchingSchool ? 'Save & Sync School' : 'Save Changes')
    : (createMatchingSchool ? 'Create Organization & School' : 'Create Organization')

  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          <FiX className="h-4 w-4" />
          Cancel
        </Button>
        {!isEdit && (
          <Button type="button" variant="secondary" onClick={onReset}>
            Reset
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        {!isEdit && step !== 'identity' && (
          <Button type="button" variant="secondary" onClick={onBack}>
            <FiArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}

        {!isEdit && step !== 'review' ? (
          <Button type="button" onClick={onNext}>
            Continue
            <FiArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" loading={isPending}>
            <FiSave className="h-4 w-4" />
            {submitLabel}
          </Button>
        )}
      </div>
    </Card>
  )
}

function PreviewCard({ values, isEdit, logoUrl, createMatchingSchool }) {
  const initials = getInitials(values.organization_name || 'New Org')
  const location = [values.city, values.state, values.country].filter(Boolean).join(', ')

  return (
    <Card className="overflow-hidden p-0">
      <div className="gradient-primary px-5 py-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/90 text-lg font-bold border border-[var(--clay-glass-edge)]">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">
              {values.organization_name || 'Organization name'}
            </p>
            <p className="mt-0.5 truncate font-mono text-sm text-white/80">
              {values.organization_code || 'organization_code'}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-5 text-sm">
        <div className="flex items-center gap-2 text-muted">
          <FiMail className="h-4 w-4 shrink-0" />
          <span className="truncate">{values.email || 'No email added'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted">
          <FiPhone className="h-4 w-4 shrink-0" />
          <span>{values.phone || 'No phone added'}</span>
        </div>
        <div className="flex items-center gap-2 text-muted">
          <FiGlobe className="h-4 w-4 shrink-0" />
          <span className="truncate">{values.website || 'No website'}</span>
        </div>
        <div className="flex items-start gap-2 text-muted">
          <FiMapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{location || values.address || 'No location set'}</span>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-muted">
          {isEdit
            ? createMatchingSchool
              ? 'Will update organization and sync the matching school'
              : 'Updating organization profile'
            : createMatchingSchool
              ? 'Will create organization and a matching school'
              : 'Live preview as you fill the form'}
        </div>
      </div>
    </Card>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-text">{value || '—'}</dd>
    </div>
  )
}

function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <Card>
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </Card>
  )
}

export default function OrganizationForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState('identity')
  const [codeTouched, setCodeTouched] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [existingLogoUrl, setExistingLogoUrl] = useState(null)
  const [logoError, setLogoError] = useState('')
  const [createMatchingSchool, setCreateMatchingSchool] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: DEFAULT_VALUES, mode: 'onBlur' })

  const values = watch()

  const { data, isLoading, error } = useQuery({
    queryKey: ['organizations', id],
    queryFn: () => organizationService.get(id),
    enabled: isEdit,
  })

  const organizationCode = watch('organization_code')

  const { data: matchingSchool } = useQuery({
    queryKey: ['schools', 'org-match', id, organizationCode],
    queryFn: () => findMatchingSchool(id, organizationCode),
    enabled: isEdit && Boolean(id) && Boolean(organizationCode),
  })

  useEffect(() => {
    if (data && isEdit) {
      const item = unwrapData(data)
      const logoUrl = item.logo ? resolveMediaUrl(item.logo) : null
      reset({
        organization_name: item.organization_name || '',
        organization_code: item.organization_code || '',
        email: item.email || '',
        phone: item.phone || '',
        website: item.website || '',
        address: item.address || '',
        city: item.city || '',
        state: item.state || '',
        country: item.country || '',
      })
      setCodeTouched(true)
      setExistingLogoUrl(logoUrl)
      setLogoPreview(logoUrl)
      setLogoFile(null)
      setLogoError('')
    }
  }, [data, isEdit, reset])

  useEffect(() => () => {
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
  }, [logoPreview])

  const handleLogoSelect = (file) => {
    if (!LOGO_ACCEPT.split(',').includes(file.type)) {
      setLogoError('Please upload a PNG, JPG, WebP, or GIF image.')
      return
    }
    if (file.size > LOGO_MAX_BYTES) {
      setLogoError('Logo must be 2 MB or smaller.')
      return
    }
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
    setLogoError('')
  }

  const handleLogoClear = () => {
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setLogoFile(null)
    setLogoPreview(existingLogoUrl)
    setLogoError('')
  }

  const handleFormReset = () => {
    reset(DEFAULT_VALUES)
    setCodeTouched(false)
    setStep('identity')
    if (logoPreview?.startsWith('blob:')) URL.revokeObjectURL(logoPreview)
    setLogoFile(null)
    setLogoPreview(null)
    setExistingLogoUrl(null)
    setLogoError('')
    setCreateMatchingSchool(false)
  }

  useEffect(() => {
    if (isEdit || codeTouched) return
    const next = slugifyOrgCode(values.organization_name)
    if (next) setValue('organization_code', next, { shouldValidate: false })
  }, [values.organization_name, isEdit, codeTouched, setValue])

  const mutation = useMutation({
    mutationFn: async (formData) => {
      if (isEdit) {
        await organizationService.update(id, buildOrganizationPayload(formData, logoFile))

        if (createMatchingSchool) {
          try {
            const schoolAction = await upsertSchoolFromOrganization(formData, id, logoFile)
            return { schoolAction }
          } catch (schoolErr) {
            const err = new Error(getErrorMessage(schoolErr, 'School could not be synced'))
            err.orgUpdated = true
            err.cause = schoolErr
            throw err
          }
        }

        return null
      }

      const orgResponse = await organizationService.create(buildOrganizationPayload(formData, logoFile))
      if (!createMatchingSchool) return orgResponse

      const orgId = await resolveCreatedOrganizationId(orgResponse, formData.organization_code)
      if (!orgId) {
        const err = new Error('Organization was created but school could not be linked (missing organization id).')
        err.orgCreated = true
        throw err
      }

      try {
        await schoolService.create(buildSchoolPayloadFromOrganization(formData, orgId, logoFile))
      } catch (schoolErr) {
        const err = new Error(getErrorMessage(schoolErr, 'School could not be created'))
        err.orgCreated = true
        err.cause = schoolErr
        throw err
      }

      return orgResponse
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      if (createMatchingSchool) {
        queryClient.invalidateQueries({ queryKey: ['schools'] })
      }
      toast.success(
        isEdit
          ? createMatchingSchool
            ? result?.schoolAction === 'updated'
              ? 'Organization updated and school synced successfully'
              : 'Organization updated and school created successfully'
            : 'Organization updated'
          : createMatchingSchool
            ? 'Organization and school created successfully'
            : 'Organization created successfully',
      )
      navigate(createMatchingSchool ? '/schools' : '/organizations')
    },
    onError: (err) => {
      if (err.orgCreated || err.orgUpdated) {
        queryClient.invalidateQueries({ queryKey: ['organizations'] })
        if (err.orgUpdated) {
          queryClient.invalidateQueries({ queryKey: ['schools'] })
        }
        toast.error(`${err.message} You can manage the school manually from Schools.`)
        navigate('/organizations')
        return
      }
      toast.error(getErrorMessage(err))
    },
  })

  const codePattern = /^[a-z][a-z0-9_]{1,48}$/

  const fieldRules = useMemo(() => ({
    organization_name: {
      required: 'Organization name is required',
      minLength: { value: 2, message: 'Name must be at least 2 characters' },
    },
    organization_code: {
      required: 'Organization code is required',
      pattern: {
        value: codePattern,
        message: 'Lowercase letters, numbers, underscores; must start with a letter',
      },
    },
    email: {
      required: 'Email is required',
      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
    },
  }), [])

  const goNext = async () => {
    const fields = STEP_FIELDS[step]
    const valid = await trigger(fields)
    if (!valid) return

    const order = STEPS.map((s) => s.id)
    const idx = order.indexOf(step)
    if (idx < order.length - 1) setStep(order[idx + 1])
  }

  const goBack = () => {
    const order = STEPS.map((s) => s.id)
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  if (isEdit && isLoading) return <PageLoader />
  if (isEdit && error) return <ErrorState message={getErrorMessage(error)} />

  const currentStepIndex = STEPS.findIndex((s) => s.id === step)
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100

  const formBody = isEdit ? (
    <div className="space-y-6">
      <SectionCard title="Identity" subtitle="Public name and system identifier" icon={FiHome}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Organization Name"
            placeholder="e.g. Greenwood Schools"
            required
            error={errors.organization_name?.message}
            {...register('organization_name', fieldRules.organization_name)}
          />
          <Input
            label="Organization Code"
            placeholder="greenwood_schools"
            required
            disabled
            hint="Code cannot be changed after creation"
            error={errors.organization_code?.message}
            {...register('organization_code', fieldRules.organization_code)}
          />
        </div>
        <div className="mt-5">
          <LogoUpload
            previewUrl={logoPreview}
            onSelect={handleLogoSelect}
            onClear={handleLogoClear}
            error={logoError}
          />
        </div>
      </SectionCard>

      <SectionCard title="Contact Information" subtitle="Primary communication channels" icon={FiMail}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Email"
            type="email"
            placeholder="contact@organization.com"
            required
            error={errors.email?.message}
            {...register('email', fieldRules.email)}
          />
          <Input
            label="Phone"
            placeholder="+91 98765 43210"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <div className="sm:col-span-2">
            <Input
              label="Website"
              placeholder="https://www.organization.com"
              error={errors.website?.message}
              {...register('website')}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Location" subtitle="Where the organization is based" icon={FiMapPin}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Textarea
              label="Street Address"
              placeholder="Building, street, area"
              error={errors.address?.message}
              {...register('address')}
            />
          </div>
          <Input label="City" placeholder="Mumbai" error={errors.city?.message} {...register('city')} />
          <Input label="State" placeholder="Maharashtra" error={errors.state?.message} {...register('state')} />
          <Input label="Country" placeholder="India" error={errors.country?.message} {...register('country')} />
        </div>
      </SectionCard>

      <SectionCard
        title="Linked School"
        subtitle="Sync or create a school with the same details"
        icon={FiLayers}
      >
        <SchoolMatchToggle
          enabled={createMatchingSchool}
          onToggle={() => setCreateMatchingSchool((prev) => !prev)}
          values={values}
          isEdit
          hasExistingSchool={Boolean(matchingSchool)}
        />
      </SectionCard>
    </div>
  ) : (
    <Card>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
            {step === 'identity' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-text">Organization identity</h2>
                  <p className="mt-1 text-sm text-muted">
                    Choose a clear name and a unique code used across the platform.
                  </p>
                </div>
                <Input
                  label="Organization Name"
                  placeholder="e.g. Greenwood Schools"
                  required
                  error={errors.organization_name?.message}
                  {...register('organization_name', fieldRules.organization_name)}
                />
                <Input
                  label="Organization Code"
                  placeholder="greenwood_schools"
                  required
                  hint="Auto-generated from name. Lowercase, underscores only."
                  error={errors.organization_code?.message}
                  {...register('organization_code', {
                    ...fieldRules.organization_code,
                    onChange: () => setCodeTouched(true),
                  })}
                />
                <LogoUpload
                  previewUrl={logoPreview}
                  onSelect={handleLogoSelect}
                  onClear={handleLogoClear}
                  error={logoError}
                />
              </div>
            )}

            {step === 'contact' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-text">Contact details</h2>
                  <p className="mt-1 text-sm text-muted">
                    How administrators and users can reach this organization.
                  </p>
                </div>
                <Input
                  label="Email"
                  type="email"
                  placeholder="contact@organization.com"
                  required
                  error={errors.email?.message}
                  {...register('email', fieldRules.email)}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Phone"
                    placeholder="+91 98765 43210"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <Input
                    label="Website"
                    placeholder="https://www.organization.com"
                    error={errors.website?.message}
                    {...register('website')}
                  />
                </div>
              </div>
            )}

            {step === 'location' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-text">Location</h2>
                  <p className="mt-1 text-sm text-muted">
                    Optional address information for reports and records.
                  </p>
                </div>
                <Textarea
                  label="Street Address"
                  placeholder="Building, street, area"
                  error={errors.address?.message}
                  {...register('address')}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input label="City" placeholder="Mumbai" error={errors.city?.message} {...register('city')} />
                  <Input label="State" placeholder="Maharashtra" error={errors.state?.message} {...register('state')} />
                  <Input label="Country" placeholder="India" error={errors.country?.message} {...register('country')} />
                </div>
              </div>
            )}

            {step === 'review' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-semibold text-text">Review & create</h2>
                  <p className="mt-1 text-sm text-muted">
                    Double-check everything before creating the organization.
                  </p>
                </div>
                <dl className="rounded-xl border border-border bg-slate-50/50 px-4">
                  <ReviewRow label="Name" value={values.organization_name} />
                  <ReviewRow label="Code" value={values.organization_code} />
                  <ReviewRow label="Logo" value={logoFile ? logoFile.name : logoPreview ? 'Uploaded' : '—'} />
                  <ReviewRow label="Email" value={values.email} />
                  <ReviewRow label="Phone" value={values.phone} />
                  <ReviewRow label="Website" value={values.website} />
                  <ReviewRow label="Address" value={values.address} />
                  <ReviewRow
                    label="Location"
                    value={[values.city, values.state, values.country].filter(Boolean).join(', ')}
                  />
                </dl>

                <SchoolMatchToggle
                  enabled={createMatchingSchool}
                  onToggle={() => setCreateMatchingSchool((prev) => !prev)}
                  values={values}
                  isEdit={false}
                  hasExistingSchool={false}
                />
              </div>
            )}
        </motion.div>
      </AnimatePresence>
    </Card>
  )

  return (
    <div className="w-full">
      <Breadcrumb
        items={[
          { label: 'Organizations', href: '/organizations' },
          { label: isEdit ? 'Edit' : 'New Organization' },
        ]}
      />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/organizations"
            className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to organizations
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            {isEdit ? 'Edit Organization' : 'Add New Organization'}
          </h1>
          <p className="mt-2 text-muted">
            {isEdit
              ? 'Update organization details. The code stays fixed for data integrity.'
              : 'Onboard a new tenant with a guided setup — identity, contact, and location.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="w-full space-y-6">
        {!isEdit && (
          <Card>
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-text">Setup progress</p>
              <span className="text-xs font-medium text-muted">
                Step {currentStepIndex + 1} of {STEPS.length} · {Math.round(progress)}%
              </span>
            </div>
            <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-200">
              <motion.div
                className="h-full gradient-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
            <HorizontalSteps steps={STEPS} current={step} onStepClick={setStep} isEdit={isEdit} />
          </Card>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            {formBody}


            <FormActions
              isEdit={isEdit}
              step={step}
              isPending={mutation.isPending}
              createMatchingSchool={createMatchingSchool}
              onCancel={() => navigate('/organizations')}
              onReset={handleFormReset}
              onBack={goBack}
              onNext={goNext}
            />
          </div>

          <aside className="lg:sticky lg:top-24">
            <PreviewCard
              values={values}
              isEdit={isEdit}
              logoUrl={logoPreview}
              createMatchingSchool={createMatchingSchool}
            />
          </aside>
        </div>
      </form>
    </div>
  )
}