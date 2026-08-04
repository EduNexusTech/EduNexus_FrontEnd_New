import { feesService } from '@/api/services'

/** CRUD service map for fee master entities. */
export const feeMasterServices = {
  categories: {
    list: feesService.categories,
    get: feesService.getCategory,
    create: feesService.createCategory,
    update: feesService.updateCategory,
    delete: feesService.deleteCategory,
    bulkUpload: feesService.categoriesBulkUpload,
  },
  'sub-categories': {
    list: feesService.subCategories,
    get: feesService.getSubCategory,
    create: feesService.createSubCategory,
    update: feesService.updateSubCategory,
    delete: feesService.deleteSubCategory,
  },
  formats: {
    list: feesService.formats,
    get: feesService.getFormat,
    create: feesService.createFormat,
    update: feesService.updateFormat,
    delete: feesService.deleteFormat,
    bulkUpload: feesService.formatsBulkUpload,
  },
  components: {
    list: feesService.components,
    get: feesService.getComponent,
    create: feesService.createComponent,
    update: feesService.updateComponent,
    delete: feesService.deleteComponent,
    bulkUpload: feesService.componentsBulkUpload,
  },
  heads: {
    list: feesService.heads,
    get: feesService.getHead,
    create: feesService.createHead,
    update: feesService.updateHead,
    delete: feesService.deleteHead,
    bulkUpload: feesService.headsBulkUpload,
  },
  'late-fee-rules': {
    list: feesService.lateFeeRules,
    create: feesService.createLateFeeRule,
  },
  'discount-rules': {
    list: feesService.discountRules,
    get: feesService.getDiscountRule,
    create: feesService.createDiscountRule,
    update: feesService.updateDiscountRule,
    delete: feesService.deleteDiscountRule,
  },
  'concession-rules': {
    list: feesService.concessionRules,
    create: feesService.createConcessionRule,
  },
  counters: {
    list: feesService.collectionCounters,
    get: feesService.getCollectionCounter,
    create: feesService.createCollectionCounter,
    update: feesService.updateCollectionCounter,
    delete: feesService.deleteCollectionCounter,
  },
  transport: {
    list: feesService.transportStructures,
    create: feesService.createTransportStructure,
  },
  hostel: {
    list: feesService.hostelStructures,
    create: feesService.createHostelStructure,
  },
}

export function getFeeMasterService(entityKey) {
  return feeMasterServices[entityKey]
}
