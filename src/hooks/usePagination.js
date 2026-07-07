import { useState, useCallback, useEffect } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/config/constants'

export function usePagination(initialSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialSize)
  const [search, setSearch] = useState('')
  const [ordering, setOrdering] = useState('')
  const [filters, setFilters] = useState({})

  const reset = useCallback(() => {
    setPage(1)
    setSearch('')
    setOrdering('')
    setFilters({})
  }, [])

  const queryParams = {
    page,
    page_size: pageSize,
    search: search || undefined,
    ordering: ordering || undefined,
    ...filters,
  }

  return {
    page,
    setPage,
    pageSize,
    setPageSize,
    search,
    setSearch,
    ordering,
    setOrdering,
    filters,
    setFilters,
    updateFilter: (key, value) => {
      setPage(1)
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    reset,
    queryParams,
  }
}

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
