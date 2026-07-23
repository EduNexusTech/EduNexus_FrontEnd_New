import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { storageService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'
import { resolveMediaUrl } from '@/utils/format'
import { compressImageFile } from '@/utils/imageCompress'
import ProfilePhotoFrame from '@/components/common/ProfilePhotoFrame'
import { cn } from '@/lib/utils'

/**
 * Upload an image to R2/local via POST /api/v1/storage/upload/.
 * Calls onUploaded({ url, path, ... }) so callers can store photo_url + photo_path.
 */
export default function PhotoUploadField({
  label = 'Photo',
  currentUrl,
  folder = 'admission_photo',
  schoolId,
  subfolder,
  onUploaded,
  onClear,
  disabled = false,
  className,
  hint = 'Large photos are compressed in your browser first for faster upload',
}) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const displaySrc = preview || resolveMediaUrl(currentUrl)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type?.startsWith('image/')) {
      toast.error('Please choose an image file')
      return
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Image must be 15 MB or smaller')
      return
    }

    setUploading(true)
    try {
      const uploadFile = await compressImageFile(file).catch(() => null)
      if (!uploadFile) {
        toast.error('Could not process this image. Try a JPG or PNG under 15 MB.')
        return
      }
      const objectUrl = URL.createObjectURL(uploadFile)
      setPreview(objectUrl)
      const response = await storageService.upload({
        file: uploadFile,
        folder,
        school: schoolId,
        subfolder,
      })
      const data = unwrapData(response) || {}
      onUploaded?.({
        url: data.url || '',
        path: data.path || '',
        file_name: data.file_name || file.name,
        ...data,
      })
      toast.success(data.compressed ? 'Photo uploaded (compressed)' : 'Photo uploaded')
    } catch (err) {
      toast.error(getErrorMessage(err))
      setPreview(null)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <span className="block text-sm font-normal text-black" style={{ fontWeight: 500 }}>
          {label}
        </span>
      ) : null}
      <div className="flex flex-wrap items-start gap-4">
        {displaySrc ? (
          <img
            src={displaySrc}
            alt=""
            className="h-48 w-36 sm:h-56 sm:w-44 shrink-0 border border-border bg-white object-contain rounded-none"
          />
        ) : (
          <ProfilePhotoFrame src={null} emptyLabel="No photo" />
        )}
        <div className="min-w-0 space-y-1.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            disabled={disabled || uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
            className="block w-full max-w-xs text-xs text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary disabled:opacity-60"
          />
          <p className="text-xs text-muted">{uploading ? 'Uploading…' : hint}</p>
          {currentUrl && onClear ? (
            <button
              type="button"
              className="text-xs font-medium text-danger hover:underline"
              disabled={disabled || uploading}
              onClick={() => {
                setPreview(null)
                onClear()
              }}
            >
              Remove photo
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
