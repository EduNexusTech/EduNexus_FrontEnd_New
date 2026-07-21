import { useCallback, useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { admissionService } from '@/api/services'
import { unwrapData, unwrapList, getErrorMessage } from '@/api/client'
import { useAdmissionSetupStore } from '../stores/admission-setup.store'
import { DEFAULT_ADMISSION_EMAIL_SETTINGS, DEFAULT_ADMISSION_FEATURES } from '../types/setup'
import { apiSetupToUi, setupFormToApi } from '../utils/leadMapper'

const SETUP_QUERY_KEY = ['admission-setup']

export function useAdmissionSetup() {
  const queryClient = useQueryClient()
  const selectedYearId = useAdmissionSetupStore((s) => s.selectedYearId)
  const setSelectedYearId = useAdmissionSetupStore((s) => s.setSelectedYearId)

  const setupQuery = useQuery({
    queryKey: SETUP_QUERY_KEY,
    queryFn: () => admissionService.setup.list(),
  })

  const emailQuery = useQuery({
    queryKey: [...SETUP_QUERY_KEY, 'email'],
    queryFn: () => admissionService.setup.getEmailSettings(),
  })

  const academicYears = useMemo(() => {
    const list = unwrapList(setupQuery.data)
    return (list.results || [])
      .map(apiSetupToUi)
      .filter(Boolean)
      .map((year) => ({
        ...year,
        features: { ...DEFAULT_ADMISSION_FEATURES, ...year.features },
      }))
  }, [setupQuery.data])

  const emailSettings = useMemo(() => {
    const raw = unwrapData(emailQuery.data) || {}
    return { ...DEFAULT_ADMISSION_EMAIL_SETTINGS, ...raw }
  }, [emailQuery.data])

  useEffect(() => {
    if (!academicYears.length) return
    const stillValid = academicYears.some((y) => y.id === selectedYearId)
    if (stillValid) return
    const current = academicYears.find((y) => y.isCurrent) ?? academicYears[0]
    setSelectedYearId(current?.id ?? null)
  }, [academicYears, selectedYearId, setSelectedYearId])

  const currentYear = useMemo(() => {
    if (!academicYears.length) return null
    return (
      academicYears.find((y) => y.id === selectedYearId) ??
      academicYears.find((y) => y.isCurrent) ??
      academicYears[0]
    )
  }, [academicYears, selectedYearId])

  const isYearActive = currentYear?.status === 'active'

  const isFeatureEnabled = useCallback(
    (feature) => Boolean(isYearActive && currentYear?.features?.[feature]),
    [currentYear, isYearActive],
  )

  const enabledFeatures = useMemo(() => {
    if (!currentYear || !isYearActive) return []
    return Object.entries(currentYear.features || {})
      .filter(([, enabled]) => enabled)
      .map(([key]) => key)
  }, [currentYear, isYearActive])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: SETUP_QUERY_KEY })

  const createMutation = useMutation({
    mutationFn: (input) => admissionService.setup.create(setupFormToApi(input)),
    onSuccess: (res) => {
      invalidate()
      const created = apiSetupToUi(unwrapData(res) || res)
      if (created?.isCurrent) setSelectedYearId(created.id)
      toast.success('Academic year saved')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, input }) => admissionService.setup.update(id, setupFormToApi(input)),
    onSuccess: () => {
      invalidate()
      toast.success('Academic year updated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => admissionService.setup.delete(id),
    onSuccess: () => {
      invalidate()
      toast.success('Academic year deleted')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const patchMutation = useMutation({
    mutationFn: ({ id, data }) => admissionService.setup.update(id, data),
    onSuccess: () => invalidate(),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const emailMutation = useMutation({
    mutationFn: (patch) => admissionService.setup.updateEmailSettings(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...SETUP_QUERY_KEY, 'email'] })
      toast.success('Email settings saved')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const addAcademicYear = useCallback(
    (input) => createMutation.mutateAsync(input),
    [createMutation],
  )

  const updateAcademicYear = useCallback(
    (id, input) => updateMutation.mutateAsync({ id, input }),
    [updateMutation],
  )

  const deleteAcademicYear = useCallback(
    (id) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  )

  const toggleYearStatus = useCallback(
    (id) => {
      const year = academicYears.find((y) => y.id === id)
      if (!year) return
      const next = year.status === 'active' ? 'inactive' : 'active'
      patchMutation.mutate({ id, data: { status: next } })
    },
    [academicYears, patchMutation],
  )

  const setCurrentYear = useCallback(
    (id) => {
      patchMutation.mutate({ id, data: { is_current: true } })
      setSelectedYearId(id)
    },
    [patchMutation, setSelectedYearId],
  )

  const toggleFeature = useCallback(
    (yearId, feature) => {
      const year = academicYears.find((y) => y.id === yearId)
      if (!year) return
      const features = {
        ...DEFAULT_ADMISSION_FEATURES,
        ...year.features,
        [feature]: !year.features?.[feature],
      }
      patchMutation.mutate({ id: yearId, data: { features } })
    },
    [academicYears, patchMutation],
  )

  const updateEmailSettings = useCallback(
    (patch) => emailMutation.mutate(patch),
    [emailMutation],
  )

  return {
    academicYears,
    selectedYearId,
    setSelectedYearId,
    emailSettings,
    updateEmailSettings,
    addAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    toggleYearStatus,
    setCurrentYear,
    toggleFeature,
    currentYear,
    isYearActive,
    isFeatureEnabled,
    enabledFeatures,
    loading: setupQuery.isLoading,
    fetching: setupQuery.isFetching,
    refetch: setupQuery.refetch,
    // compat no-op for previous store.init()
    init: () => {},
    initialized: !setupQuery.isLoading,
  }
}
