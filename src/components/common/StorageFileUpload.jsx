import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { storageService } from '@/api/services'
import { getErrorMessage, unwrapData } from '@/api/client'

/**
 * Reusable file upload control — sends multipart to /api/v1/storage/upload/.
 *
 * @param {object} props
 * @param {string} props.folder - STORAGE_FOLDERS key
 * @param {string} [props.accept]
 * @param {string} [props.label]
 * @param {string} [props.subfolder]
 * @param {string} [props.schoolId]
 * @param {(result: object) => void} [props.onUploaded]
 * @param {boolean} [props.disabled]
 */
export default function StorageFileUpload({
  folder,
  accept,
  label = 'Choose file',
  subfolder = '',
  schoolId,
  onUploaded,
  disabled = false,
  className = '',
}) {
  const [file, setFile] = useState(null)

  const uploadMut = useMutation({
    mutationFn: () => storageService.upload(file, folder, { subfolder, schoolId }),
    onSuccess: (response) => {
      const payload = unwrapData(response)
      onUploaded?.(payload)
      setFile(null)
    },
  })

  const handleUpload = useCallback(() => {
    if (!file) return
    uploadMut.mutate()
  }, [file, uploadMut])

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      <label className="text-sm font-medium text-slate-700">
        <span className="sr-only">{label}</span>
        <input
          type="file"
          accept={accept}
          disabled={disabled || uploadMut.isPending}
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="text-sm"
        />
      </label>
      <button
        type="button"
        disabled={disabled || !file || uploadMut.isPending}
        onClick={handleUpload}
        className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm font-medium text-sky-800 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploadMut.isPending ? 'Uploading…' : 'Upload'}
      </button>
      {uploadMut.isError ? (
        <span className="text-sm text-red-600">{getErrorMessage(uploadMut.error)}</span>
      ) : null}
      {file ? <span className="text-xs text-slate-500">{file.name}</span> : null}
    </div>
  )
}
