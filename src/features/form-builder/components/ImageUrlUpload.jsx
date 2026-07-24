import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FiImage, FiTrash2, FiUpload } from 'react-icons/fi'
import { storageService } from '@/api/services'
import { unwrapData, getErrorMessage } from '@/api/client'
import { STORAGE_FOLDERS } from '@/config/storageFolders'

/**
 * Upload an image to R2/local storage and set imageUrl, with optional manual URL fallback.
 */
export default function ImageUrlUpload({
  label = 'Image',
  value = '',
  onChange,
  storageFolder = STORAGE_FOLDERS.SCHOOL_BRANDING,
  subfolder = 'form-builder',
  accept = 'image/jpeg,image/png,image/webp,image/gif',
}) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const response = await storageService.upload(file, storageFolder, { subfolder })
      const data = unwrapData(response)
      if (!data?.url) throw new Error('No URL returned from upload')
      onChange(data.url)
      toast.success('Image uploaded')
    } catch (error) {
      toast.error(getErrorMessage(error, 'Image upload failed'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const clearImage = () => onChange('')

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>

      {value ? (
        <div className="relative overflow-hidden rounded-lg border border-border bg-muted/30">
          <img src={value} alt="" className="max-h-32 w-full object-cover" />
          <button
            type="button"
            onClick={clearImage}
            className="absolute right-2 top-2 rounded-md bg-white/90 p-1.5 text-red-600 shadow-sm hover:bg-white"
            title="Remove image"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-muted-foreground">
          <FiImage className="h-6 w-6 opacity-50" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleUpload}
      />

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        <FiUpload className="h-4 w-4" />
        {uploading ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
      </button>

      <div>
        <label className="mb-1 block text-[11px] text-muted-foreground">Or paste image URL</label>
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-lg border border-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-500/30"
        />
      </div>
    </div>
  )
}
