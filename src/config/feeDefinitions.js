/** Simplified Fee Management — school + academic year + fee codes workflow. */

export const FEE_SIMPLE_STEPS = [
  {
    step: 1,
    key: 'heads',
    label: 'Fee Codes',
    path: '/fees/masters/heads',
    description: 'Create fee types and default amounts (Tuition, Transport, etc.)',
  },
  {
    step: 2,
    key: 'generate',
    label: 'Generate Fees',
    path: '/fees/generate',
    description: 'Generate fees student-wise or for an entire class',
  },
  {
    step: 3,
    key: 'collect',
    label: 'Collect Payment',
    path: '/fees/collect',
    description: 'Find student by admission no. and record payment',
  },
  {
    step: 4,
    key: 'ledger',
    label: 'Fee Ledger',
    path: '/fees/ledger',
    description: 'View fee history and all transactions for a student',
  },
]

/** Hub extras — optional utilities */
export const FEE_HUB_EXTRAS = [
  { key: 'class-paid', label: 'Class-wise Fee Paid', path: '/fees/reports/class-wise-paid', description: 'See who paid fees by class & section' },
  { key: 'defaulters', label: 'Defaulters', path: '/fees/defaulters', description: 'Students with overdue balances' },
]

export const FEE_MASTER_DEFINITIONS = {
  heads: {
    key: 'heads',
    label: 'Fee Code',
    labelPlural: 'Fee Codes',
    serviceKey: 'heads',
    bulkUploadKey: 'headsBulkUpload',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. Annual Tuition' },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true, placeholder: 'e.g. tuition' },
      { name: 'default_amount', label: 'Default Amount', type: 'number', required: true },
      { name: 'category', label: 'Billing Frequency', type: 'select', options: [
        { label: 'One Time', value: 'one_time' },
        { label: 'Annual', value: 'annual' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Quarterly', value: 'quarterly' },
        { label: 'Installment', value: 'installment' },
      ]},
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'default_amount', header: 'Amount' },
      { accessorKey: 'category', header: 'Frequency' },
      { accessorKey: 'is_active', header: 'Active', cell: ({ getValue }) => (getValue() ? 'Yes' : 'No') },
    ],
  },
}

export function getFeeMasterDefinition(entityKey) {
  return FEE_MASTER_DEFINITIONS[entityKey]
}
