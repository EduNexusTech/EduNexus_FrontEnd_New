import { useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { storageService } from '@/api/services'
import { unwrapData } from '@/api/client'

/**
 * Hook for programmatic uploads to R2 via the backend storage API.
 */
export function useStorageUpload({ folder, subfolder = '', schoolId, onSuccess } = {}) {
  const mutation = useMutation({
    mutationFn: (file) => storageService.upload(file, folder, { subfolder, schoolId }),
    onSuccess: (response) => {
      onSuccess?.(unwrapData(response))
    },
  })

  const uploadFile = useCallback(
    (file) => {
      if (!file || !folder) return Promise.reject(new Error('file and folder are required'))
      return mutation.mutateAsync(file)
    },
    [folder, mutation],
  )

  return {
    uploadFile,
    isUploading: mutation.isPending,
    error: mutation.error,
    data: mutation.data ? unwrapData(mutation.data) : null,
    reset: mutation.reset,
  }
}
