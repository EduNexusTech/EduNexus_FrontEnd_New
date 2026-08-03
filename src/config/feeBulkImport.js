/** Bulk-import columns for fee codes only. */

const ACTIVE = { key: 'is_active', header: 'is_active', type: 'boolean', default: true }
const NAME_CODE = [
  { key: 'name', header: 'name', required: true },
  { key: 'code', header: 'code', required: true },
]

export const FEE_BULK_IMPORT = {
  heads: {
    columns: [
      ...NAME_CODE,
      { key: 'default_amount', header: 'default_amount', type: 'number', default: 0 },
      { key: 'category', header: 'category', default: 'annual' },
      ACTIVE,
    ],
    exampleRows: [
      {
        name: 'Annual Tuition',
        code: 'tuition',
        default_amount: '30000',
        category: 'annual',
        is_active: 'yes',
      },
      {
        name: 'Transport Fee',
        code: 'transport',
        default_amount: '12000',
        category: 'annual',
        is_active: 'yes',
      },
    ],
  },
}

export function getFeeBulkImportConfig(entityKey) {
  return FEE_BULK_IMPORT[entityKey] || { columns: [...NAME_CODE, ACTIVE], exampleRows: [] }
}
