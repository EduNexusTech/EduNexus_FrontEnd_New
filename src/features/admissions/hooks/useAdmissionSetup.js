import { useEffect, useMemo } from 'react'
import { useAdmissionSetupStore } from '../stores/admission-setup.store'

export function useAdmissionSetup() {
  const store = useAdmissionSetupStore()

  useEffect(() => {
    store.init()
  }, [store.init])

  const currentYear = useMemo(() => {
    if (!store.academicYears.length) return null
    return (
      store.academicYears.find((y) => y.id === store.selectedYearId) ??
      store.academicYears.find((y) => y.isCurrent) ??
      store.academicYears[0]
    )
  }, [store.academicYears, store.selectedYearId])

  const isYearActive = currentYear?.status === 'active'

  const isFeatureEnabled = (feature) => Boolean(isYearActive && currentYear?.features?.[feature])

  const enabledFeatures = useMemo(() => {
    if (!currentYear || !isYearActive) return []
    return Object.entries(currentYear.features)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key)
  }, [currentYear, isYearActive])

  return {
    ...store,
    currentYear,
    isYearActive,
    isFeatureEnabled,
    enabledFeatures,
  }
}
