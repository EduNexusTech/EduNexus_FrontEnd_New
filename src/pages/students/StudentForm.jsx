import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { PageHeader, Card } from '@/components/ui/Card'
import Breadcrumb from '@/components/layout/Breadcrumb'
import Button from '@/components/ui/Button'
import Input, { Textarea, SelectField } from '@/components/ui/Input'
import { PageLoader, ErrorState } from '@/components/ui/Feedback'
import { studentService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { STUDENT_STATUS_OPTIONS } from '@/config/constants'
import ProfilePhotoFrame from '@/components/common/ProfilePhotoFrame'
import { compressImageFile } from '@/utils/imageCompress'
import { registerValidated, RHF_VALIDATION_MODE } from '@/utils/validation'

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

const defaultValues = {
  first_name: '',
  last_name: '',
  email: '',
  mobile_number: '',
  admission_number: '',
  roll_number: '',
  date_of_birth: '',
  gender: '',
  blood_group: '',
  address: '',
  city: '',
  pincode: '',
  previous_school: '',
  previous_class: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  status: 'active',
  notes: '',
}

function StudentPhotoField({ currentUrl, pendingFile, uploading, onFileChange, onClearPending }) {
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (pendingFile) {
      const objectUrl = URL.createObjectURL(pendingFile)
      setPreview(objectUrl)
      return () => URL.revokeObjectURL(objectUrl)
    }
    setPreview(null)
    return undefined
  }, [pendingFile])

  return (
    <div className="sm:col-span-2 lg:col-span-3 rounded-xl border border-border bg-slate-50/60 p-4">
      <label className="block text-sm font-medium text-text mb-3">Student Photo</label>
      <div className="flex flex-wrap items-start gap-5">
        {preview ? (
          <img
            src={preview}
            alt="Student preview"
            className="h-48 w-36 sm:h-56 sm:w-44 shrink-0 border border-border bg-white object-contain rounded-none shadow-sm"
          />
        ) : (
          <ProfilePhotoFrame src={currentUrl} alt="Student photo" />
        )}
        <div className="space-y-1.5 min-w-[220px]">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => {
              onFileChange(e.target.files?.[0] || null)
              e.target.value = ''
            }}
            className="block w-full max-w-xs text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary disabled:opacity-60"
          />
          <p className="text-xs text-muted">
            {uploading
              ? 'Uploading…'
              : 'Large photos are compressed in your browser first for faster upload'}
          </p>
          {pendingFile ? (
            <button
              type="button"
              className="text-xs font-medium text-danger hover:underline"
              onClick={onClearPending}
            >
              Clear selected photo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function StudentForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [photoUrl, setPhotoUrl] = useState('')
  const [pendingPhotoFile, setPendingPhotoFile] = useState(null)
  const [photoUploading, setPhotoUploading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues,
    ...RHF_VALIDATION_MODE,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['students', id],
    queryFn: () => studentService.get(id),
    enabled: isEdit,
  })

  useEffect(() => {
    if (!data || !isEdit) return
    const item = unwrapData(data)
    reset({
      first_name: item.full_name?.split(' ')[0] || '',
      last_name: item.full_name?.split(' ').slice(1).join(' ') || '',
      email: item.email || '',
      mobile_number: item.mobile_number || '',
      admission_number: item.admission_number || '',
      roll_number: item.roll_number || '',
      date_of_birth: item.date_of_birth || '',
      gender: item.gender || '',
      blood_group: item.blood_group || '',
      address: item.address || '',
      city: item.city || '',
      pincode: item.pincode || '',
      previous_school: item.previous_school || '',
      previous_class: item.previous_class || '',
      emergency_contact_name: item.emergency_contact_name || '',
      emergency_contact_phone: item.emergency_contact_phone || '',
      status: item.status || 'active',
      notes: item.notes || '',
    })
    setPhotoUrl(item.photo_url || '')
    setPendingPhotoFile(null)
  }, [data, isEdit, reset])

  const uploadPhotoForStudent = async (studentId, file) => {
    const fd = new FormData()
    fd.append('file', file)
    const response = await studentService.uploadPhoto(studentId, fd)
    const payload = unwrapData(response) || {}
    return payload.photo_url || payload.url || payload.student?.photo_url || ''
  }

  const handlePhotoSelected = async (file) => {
    if (!file) return
    if (!file.type?.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image must be 15 MB or smaller')
      return
    }

    let uploadFile = file
    try {
      uploadFile = await compressImageFile(file)
      if (!uploadFile) {
        toast.error('Could not process this image. Try a JPG or PNG under 15 MB.')
        return
      }
    } catch {
      uploadFile = file
    }

    if (isEdit) {
      setPhotoUploading(true)
      try {
        const url = await uploadPhotoForStudent(id, uploadFile)
        setPhotoUrl(url || photoUrl)
        setPendingPhotoFile(null)
        queryClient.invalidateQueries({ queryKey: ['students', id] })
        toast.success('Photo uploaded')
      } catch (err) {
        toast.error(getErrorMessage(err))
      } finally {
        setPhotoUploading(false)
      }
      return
    }

    setPendingPhotoFile(uploadFile)
  }

  const mutation = useMutation({
    mutationFn: async (values) => {
      const response = isEdit
        ? await studentService.update(id, values)
        : await studentService.create(values)

      const saved = unwrapData(response)
      const studentId = saved?.student_id || saved?.id || id

      if (pendingPhotoFile && studentId) {
        await uploadPhotoForStudent(studentId, pendingPhotoFile)
      }

      return response
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toast.success(isEdit ? 'Student updated' : 'Student created')
      navigate('/students')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (isEdit && isLoading) return <PageLoader />
  if (isEdit && error) return <ErrorState message={getErrorMessage(error)} />

  return (
    <div className="lms-page w-full">
      <Breadcrumb items={[{ label: 'Students', href: '/students' }, { label: isEdit ? 'Edit' : 'New' }]} />
      <PageHeader title={isEdit ? 'Edit Student' : 'New Student'} />

      <Card className="w-full lms-form-card">
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="grid gap-4 p-1 [grid-template-columns:minmax(0,1fr)] sm:[grid-template-columns:repeat(2,minmax(0,1fr))] lg:[grid-template-columns:repeat(3,minmax(0,1fr))]"
        >
          <StudentPhotoField
            currentUrl={photoUrl}
            pendingFile={pendingPhotoFile}
            uploading={photoUploading || mutation.isPending}
            onFileChange={handlePhotoSelected}
            onClearPending={() => setPendingPhotoFile(null)}
          />

          <Input label="First Name" required error={errors.first_name?.message} {...register('first_name', { required: 'First name is required' })} />
          <Input label="Last Name" {...register('last_name')} />
          <Input label="Email" error={errors.email?.message} {...registerValidated(register, 'email', { label: 'Email', type: 'email' })} />
          <Input label="Mobile" required error={errors.mobile_number?.message} {...registerValidated(register, 'mobile_number', { required: true, label: 'Mobile' })} />
          <Input label="Admission Number" {...register('admission_number')} />
          <Input label="Roll Number" {...register('roll_number')} />
          <Input label="Date of Birth" type="date" {...register('date_of_birth')} />
          <SelectField label="Gender" options={GENDER_OPTIONS} placeholder="Select gender" {...register('gender')} />
          <Input label="Blood Group" {...register('blood_group')} />
          <div className="sm:col-span-2 lg:col-span-3">
            <Textarea label="Address" {...register('address')} />
          </div>
          <Input label="City" {...register('city')} />
          <Input label="Pincode" error={errors.pincode?.message} {...registerValidated(register, 'pincode', { label: 'Pincode' })} />
          <Input label="Previous School" {...register('previous_school')} />
          <Input label="Previous Class" {...register('previous_class')} />
          <Input label="Emergency Contact" {...register('emergency_contact_name')} />
          <Input label="Emergency Phone" error={errors.emergency_contact_phone?.message} {...registerValidated(register, 'emergency_contact_phone', { label: 'Emergency phone' })} />
          <SelectField label="Status" options={STUDENT_STATUS_OPTIONS} {...register('status')} />
          <div className="sm:col-span-2 lg:col-span-3">
            <Textarea label="Notes" {...register('notes')} />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3 pt-4 border-t border-[var(--clay-border)]">
            <Button type="submit" variant="primary" loading={mutation.isPending}>
              {isEdit ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="cancel" onClick={() => navigate('/students')}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset()
                setPendingPhotoFile(null)
                if (isEdit) {
                  setPhotoUrl(unwrapData(data)?.photo_url || '')
                } else {
                  setPhotoUrl('')
                }
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
