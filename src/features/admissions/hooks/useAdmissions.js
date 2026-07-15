import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { admissionService } from '@/api/services'
import { unwrapList, getErrorMessage } from '@/api/client'
import { useAdmissionSetup } from './useAdmissionSetup'
import { apiLeadToUi, enquiryFormToApi, stageChangeToApi } from '../utils/leadMapper'

const DEFAULT_FILTERS = {
  search: '',
  stage: 'all',
  source: 'all',
  priority: 'all',
  grade: 'all',
}

const PAGE_SIZE = 8

function matchesFilters(lead, filters) {
  const q = filters.search.toLowerCase().trim()
  if (q) {
    const haystack = [
      lead.studentName,
      lead.parentName,
      lead.email,
      lead.phone,
      lead.id,
      lead.enquiryNumber,
      lead.gradeApplying,
    ]
      .join(' ')
      .toLowerCase()
    if (!haystack.includes(q)) return false
  }
  if (filters.stage !== 'all' && lead.stage !== filters.stage) return false
  if (filters.source !== 'all' && lead.source !== filters.source) return false
  if (filters.priority !== 'all' && lead.priority !== filters.priority) return false
  if (filters.grade !== 'all' && lead.gradeApplying !== filters.grade) return false
  return true
}

export function useAdmissions(options = {}) {
  const {
    initialViewMode = 'table',
    excludeStages = [],
    initialApplicationType = 'all',
  } = options

  const queryClient = useQueryClient()
  const { currentYear, isFeatureEnabled } = useAdmissionSetup()
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [viewMode, setViewMode] = useState(initialViewMode)
  const [page, setPage] = useState(1)
  const [selectedLead, setSelectedLead] = useState(null)

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admission-leads', 'crm', currentYear?.label],
    queryFn: () => admissionService.leads.list({ page_size: 500 }),
  })

  const list = unwrapList(data)
  const rawRows = list.results || []

  const leads = useMemo(() => {
    const mapped = rawRows.map(apiLeadToUi).filter(Boolean)
    if (!currentYear?.label) return mapped
    return mapped.filter(
      (l) => l.academicYear === '—' || l.academicYear === currentYear.label || !l.academicYear,
    )
  }, [rawRows, currentYear?.label])

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (excludeStages.includes(lead.stage)) return false
      if (initialApplicationType === 'internal' && lead.applicationType !== 'internal') return false
      if (initialApplicationType === 'external' && lead.applicationType !== 'external') return false
      return matchesFilters(lead, filters)
    })
  }, [leads, excludeStages, filters, initialApplicationType])

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE))
  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredLeads.slice(start, start + PAGE_SIZE)
  }, [filteredLeads, page])

  useEffect(() => {
    setPage(1)
  }, [filters, viewMode, currentYear?.label])

  const updateFilters = useCallback((patch) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  const resetFilters = useCallback(() => setFilters({ ...DEFAULT_FILTERS }), [])

  const createMutation = useMutation({
    mutationFn: (values) => admissionService.leads.create(enquiryFormToApi(values)),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admission-leads'] })
      const created = apiLeadToUi(res?.data || res)
      if (created) setSelectedLead(created)
      toast.success('Enquiry saved successfully')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }) => admissionService.leads.update(id, stageChangeToApi(stage)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-leads'] })
      toast.success('Stage updated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const convertMutation = useMutation({
    mutationFn: (id) => admissionService.leads.convert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admission-leads'] })
      queryClient.invalidateQueries({ queryKey: ['admission-applications'] })
      toast.success('Lead converted to application')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const addEnquiry = useCallback(
    async (values) => {
      const res = await createMutation.mutateAsync(values)
      return apiLeadToUi(res?.data || res)
    },
    [createMutation],
  )

  const updateLeadStage = useCallback(
    (leadId, stage) => {
      stageMutation.mutate({ id: leadId, stage })
      setSelectedLead((prev) => (prev?.id === leadId ? { ...prev, stage } : prev))
    },
    [stageMutation],
  )

  const convertLead = useCallback(
    (leadId) => convertMutation.mutate(leadId),
    [convertMutation],
  )

  const leadSheetProps = {
    selectedLead,
    onCloseLead: () => setSelectedLead(null),
    onStageChange: updateLeadStage,
    onConvertLead: convertLead,
    setSelectedLead,
  }

  return {
    leads,
    filteredLeads,
    paginatedLeads,
    loading: isLoading,
    fetching: isFetching,
    refetch,
    filters,
    updateFilters,
    resetFilters,
    viewMode,
    setViewMode,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
    selectedLead,
    setSelectedLead,
    addEnquiry,
    updateLeadStage,
    convertLead,
    leadSheetProps,
    isFeatureEnabled,
    currentYear,
    creating: createMutation.isPending,
  }
}
