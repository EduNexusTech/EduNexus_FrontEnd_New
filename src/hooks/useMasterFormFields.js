import { MASTER_DEFINITIONS } from '@/config/masterDefinitions'
import { transformScopedLoad } from '@/config/formFieldConfig'
import { useScopedFormFields } from '@/hooks/useScopedFormFields'

export function useMasterFormFields(masterKey) {
  const def = MASTER_DEFINITIONS[masterKey]
  const scoped = useScopedFormFields(def)
  return {
    ...scoped,
    def,
    transformLoad: transformScopedLoad,
  }
}

export { transformScopedLoad as transformMasterLoad } from '@/config/formFieldConfig'
