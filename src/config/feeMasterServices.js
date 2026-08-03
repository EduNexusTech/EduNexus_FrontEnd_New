import { feesService } from '@/api/services'

/** CRUD service map for fee master entities. */
export const feeMasterServices = {
  heads: {
    list: feesService.heads,
    get: feesService.getHead,
    create: feesService.createHead,
    update: feesService.updateHead,
    delete: feesService.deleteHead,
    bulkUpload: feesService.headsBulkUpload,
  },
}

export function getFeeMasterService(entityKey) {
  return feeMasterServices[entityKey]
}
