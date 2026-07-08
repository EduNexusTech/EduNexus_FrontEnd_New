import { unwrapList } from '@/api/client'
import { resolveRecordId } from '@/utils/record'

function patchResults(data, updater) {
  if (!data) return data

  const list = unwrapList(data)
  const nextResults = updater(list.results || [])
  const removed = (list.results || []).length - nextResults.length
  const nextCount = Math.max(0, (list.count || 0) - removed)

  if (Array.isArray(data)) {
    return nextResults
  }

  if (Array.isArray(data.results)) {
    return { ...data, results: nextResults, count: nextCount }
  }

  if (data?.data?.results) {
    return {
      ...data,
      data: {
        ...data.data,
        results: nextResults,
        count: nextCount,
      },
    }
  }

  return data
}

export function removeFromListCache(data, deletedId) {
  return patchResults(data, (results) =>
    results.filter((row) => String(resolveRecordId(row)) !== String(deletedId)),
  )
}

export function markInactiveInListCache(data, recordId) {
  return patchResults(data, (results) =>
    results.map((row) =>
      String(resolveRecordId(row)) === String(recordId)
        ? { ...row, is_active: false }
        : row,
    ),
  )
}
