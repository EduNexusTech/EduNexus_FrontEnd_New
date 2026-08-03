import { getUserOrganizationId, getUserSchoolId } from '@/utils/schoolScope'

/** Pre-fill org/school on master create forms for scoped users. */
export {
  buildScopedPayload as buildMasterScopePayload,
  getScopedCreateDefaults as getMasterCreateDefaults,
} from '@/utils/scopePayload'

export { getUserOrganizationId, getUserSchoolId }
