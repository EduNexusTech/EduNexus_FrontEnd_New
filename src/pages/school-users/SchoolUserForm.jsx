import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import Input, { SelectField, CheckboxField, PasswordInput } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { schoolUserService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { SCHOOL_STAFF_ROLES } from '@/config/constants'
import { saveUserPassword } from '@/utils/userPasswordStorage'
import { resolveMediaUrl } from '@/utils/format'
import { registerValidated, RHF_VALIDATION_MODE } from '@/utils/validation'

function ProfilePhotoField({ currentUrl, file, onChange }) {
  const preview = file ? URL.createObjectURL(file) : resolveMediaUrl(currentUrl)
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text">Profile Photo</label>
      {preview ? (
        <img src={preview} alt="Profile preview" className="h-20 w-20 rounded-full object-cover border border-border" />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-xs text-muted">No photo</div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
        className="block w-full text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary"
      />
    </div>
  )
}

function buildFormData(values, profileFile) {
  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (typeof value === 'boolean') {
      formData.append(key, value ? 'true' : 'false')
    } else {
      formData.append(key, value)
    }
  })
  if (profileFile) formData.append('profile_image', profileFile)
  return formData
}

export default function SchoolUserForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [profileFile, setProfileFile] = useState(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    ...RHF_VALIDATION_MODE,
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      mobile_number: '',
      staff_role: '',
      password: '',
      is_active: true,
      send_credentials: true,
      send_email: true,
      send_sms: true,
    },
  })

  const sendCredentials = watch('send_credentials')

  const { data, isLoading, error } = useQuery({
    queryKey: ['school-users', id],
    queryFn: () => schoolUserService.get(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!data || !isEdit) return
    const item = unwrapData(data)
    reset({
      first_name: item.first_name || '',
      last_name: item.last_name || '',
      email: item.email || '',
      mobile_number: item.mobile_number || '',
      staff_role: item.staff_role || '',
      password: '',
      is_active: item.is_active ?? true,
      send_credentials: false,
      send_email: true,
      send_sms: true,
    })
  }, [data, isEdit, reset])

  const mutation = useMutation({
    mutationFn: (values) => {
      const payload = { ...values }
      if (!payload.password) delete payload.password
      if (isEdit) {
        delete payload.send_credentials
        delete payload.send_email
        delete payload.send_sms
      }
      const body = profileFile ? buildFormData(payload, profileFile) : payload
      return isEdit ? schoolUserService.update(id, body) : schoolUserService.create(body)
    },
    onSuccess: (response, values) => {
      queryClient.invalidateQueries({ queryKey: ['school-users'] })
      const created = unwrapData(response)
      const userId = created?.user_id || created?.id || id
      const password = created?.generated_password || values.password
      if (!isEdit && password) {
        saveUserPassword(userId, password, values.email)
      }
      if (created?.credential_delivery) {
        toast.success('Credentials delivery attempted')
      }
      toast.success(isEdit ? 'User updated' : 'User created')
      navigate('/school-users')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (isEdit && isLoading) return <PageLoader />
  if (isEdit && error) return <ErrorState message={getErrorMessage(error)} />

  const profile = isEdit ? unwrapData(data) : null

  return (
    <div className="w-full">
      <Breadcrumb items={[{ label: 'School Users', href: '/school-users' }, { label: isEdit ? 'Edit' : 'New' }]} />
      <PageHeader title={isEdit ? 'Edit School User' : 'New School User'} subtitle="Username is generated automatically if not provided" />

      <Card className="w-full">
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2 lg:col-span-3">
            <ProfilePhotoField
              currentUrl={profile?.profile_image_url}
              file={profileFile}
              onChange={setProfileFile}
            />
          </div>

          <Input label="First Name" required error={errors.first_name?.message} {...register('first_name', { required: 'First name is required' })} />
          <Input label="Last Name" {...register('last_name')} />
          <Input label="Email" error={errors.email?.message} {...registerValidated(register, 'email', { label: 'Email', type: 'email' })} />
          <Input label="Mobile" error={errors.mobile_number?.message} {...registerValidated(register, 'mobile_number', { label: 'Mobile' })} />

          <SelectField
            label="Staff Role"
            required
            options={SCHOOL_STAFF_ROLES}
            placeholder="Select role"
            {...register('staff_role', { required: 'Role is required' })}
          />

          {!isEdit && (
            <>
              <PasswordInput
                label="Password (optional)"
                placeholder="Leave blank to auto-generate"
                {...register('password')}
              />
              <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-4">
                <CheckboxField label="Send credentials after create" {...register('send_credentials')} />
                {sendCredentials && (
                  <>
                    <CheckboxField label="Email" {...register('send_email')} />
                    <CheckboxField label="SMS" {...register('send_sms')} />
                  </>
                )}
              </div>
            </>
          )}

          <CheckboxField label="Active" {...register('is_active')} />

          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3 pt-4 border-t border-border">
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? 'Update' : 'Create User'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/school-users')}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
