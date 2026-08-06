/** Enterprise Fee Management — masters, workflow, reports. */

export const FEE_WORKFLOW_STEPS = [
  {
    step: 1,
    key: 'masters',
    label: 'Fee Masters',
    path: '/fees/masters/categories',
    description: 'Categories, heads, formats, installments',
  },
  {
    step: 2,
    key: 'structure',
    label: 'Fee Structure',
    path: '/fees/structure',
    description: 'Class-wise fee templates & payment plans',
  },
  {
    step: 3,
    key: 'generate',
    label: 'Generate Fees',
    path: '/fees/generate',
    description: 'Assign fees to students or class sections',
  },
  {
    step: 4,
    key: 'collect',
    label: 'Collect Payment',
    path: '/fees/collect',
    description: 'Counter collection with split pay & wallet',
  },
  {
    step: 5,
    key: 'ledger',
    label: 'Fee Ledger',
    path: '/fees/ledger',
    description: 'Student transactions, receipts & refunds',
  },
]

export const FEE_MASTER_NAV = [
  { key: 'categories', label: 'Categories', path: '/fees/masters/categories' },
  { key: 'sub-categories', label: 'Sub Categories', path: '/fees/masters/sub-categories' },
  { key: 'formats', label: 'Formats', path: '/fees/masters/formats' },
  { key: 'components', label: 'Components', path: '/fees/masters/components' },
  { key: 'heads', label: 'Fee Heads', path: '/fees/masters/heads' },
  { key: 'late-fee-rules', label: 'Late Fee Rules', path: '/fees/masters/late-fee-rules' },
  { key: 'discount-rules', label: 'Discount Rules', path: '/fees/masters/discount-rules' },
  { key: 'concession-rules', label: 'Concession Rules', path: '/fees/masters/concession-rules' },
  { key: 'counters', label: 'Counters', path: '/fees/masters/counters' },
]

export const FEE_HUB_MODULES = [
  { key: 'structure', label: 'Structure Builder', path: '/fees/structure', desc: 'Class / section fee templates' },
  { key: 'payment-plans', label: 'Payment Plans', path: '/fees/payment-plans', desc: 'Installment schedules' },
  { key: 'discounts', label: 'Discounts & Concessions', path: '/fees/discounts', desc: 'Rules & approvals' },
  { key: 'transport', label: 'Transport Fees', path: '/fees/masters/transport', desc: 'Route / distance based' },
  { key: 'hostel', label: 'Hostel Fees', path: '/fees/masters/hostel', desc: 'Room / mess / deposit' },
  { key: 'settings', label: 'Fee Settings', path: '/fees/settings', desc: 'School billing configuration' },
  { key: 'daily-closing', label: 'Daily Closing', path: '/fees/daily-closing', desc: 'Counter day-end register' },
  { key: 'reports', label: 'Reports Hub', path: '/fees/reports', desc: 'Collection, outstanding, registers' },
]

export const FEE_REPORT_LINKS = [
  { key: 'class-paid', label: 'Class-wise Fee Paid', path: '/fees/reports/class-wise-paid' },
  { key: 'defaulters', label: 'Defaulters', path: '/fees/defaulters' },
  { key: 'daily-collection', label: 'Daily Collection', path: '/fees/reports/daily-collection' },
  { key: 'outstanding', label: 'Outstanding Report', path: '/fees/reports/outstanding' },
  { key: 'collection-summary', label: 'Collection Summary', path: '/fees/reports/collection-summary' },
  { key: 'payment-methods', label: 'Payment Methods', path: '/fees/reports/payment-methods' },
]

const CATEGORY_TYPE_OPTIONS = [
  { label: 'General', value: 'general' },
  { label: 'Tuition', value: 'tuition' },
  { label: 'Transport', value: 'transport' },
  { label: 'Hostel', value: 'hostel' },
  { label: 'Annual', value: 'annual' },
  { label: 'Admission', value: 'admission' },
]

const RECURRENCE_OPTIONS = [
  { label: 'Annual', value: 'annual' },
  { label: 'Semester', value: 'semester' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Installment', value: 'installment' },
  { label: 'Custom', value: 'custom' },
]

const BILLING_FREQ_OPTIONS = [
  { label: 'One Time', value: 'one_time' },
  { label: 'Annual', value: 'annual' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Installment', value: 'installment' },
]

const DISCOUNT_TYPE_OPTIONS = [
  { label: 'Percentage', value: 'percentage' },
  { label: 'Flat Amount', value: 'flat' },
  { label: 'Sibling', value: 'sibling' },
  { label: 'Staff Child', value: 'staff_child' },
  { label: 'Merit Scholarship', value: 'merit_scholarship' },
  { label: 'EWS', value: 'ews' },
  { label: 'Custom', value: 'custom' },
]

export const CONCESSION_TYPE_OPTIONS = [
  { label: 'Sibling', value: 'sibling' },
  { label: 'Staff Child', value: 'staff_child' },
  { label: 'Management Quota', value: 'management_quota' },
  { label: 'Government', value: 'government' },
  { label: 'Financial Aid', value: 'financial_aid' },
  { label: 'Custom', value: 'custom' },
]

export const CONCESSION_APPLY_SCOPE_OPTIONS = [
  { label: 'All fee items', value: 'all' },
  { label: 'Fee structure(s) only', value: 'fee_structure' },
  { label: 'Fee code(s) only', value: 'fee_codes' },
]

const LATE_FEE_FREQ = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

const LATE_FEE_CALC = [
  { label: 'Fixed', value: 'fixed' },
  { label: 'Percentage', value: 'percentage' },
]

const TRANSPORT_BASIS = [
  { label: 'Flat Monthly', value: 'flat' },
  { label: 'Distance', value: 'distance' },
  { label: 'Route', value: 'route' },
  { label: 'Pickup Point', value: 'pickup_point' },
]

const HOSTEL_COMPONENT = [
  { label: 'Room', value: 'room' },
  { label: 'Mess', value: 'mess' },
  { label: 'Laundry', value: 'laundry' },
  { label: 'Security Deposit', value: 'security_deposit' },
]

/** Backward-compatible 4-step workflow cards on hub */
export const FEE_SIMPLE_STEPS = [
  { step: 1, key: 'heads', label: 'Fee Codes', path: '/fees/masters/heads', description: 'Create fee codes with default amounts' },
  { step: 2, key: 'structure', label: 'Fee Structure', path: '/fees/structure', description: 'Map fee codes into a structure for the year' },
  { step: 3, key: 'generate', label: 'Generate Fees', path: '/fees/generate', description: 'Apply a structure class-wise or student-wise' },
  { step: 4, key: 'collect', label: 'Collect Payment', path: '/fees/collect', description: 'Select fee items, pay installment-wise, print receipt' },
  { step: 5, key: 'ledger', label: 'Fee Ledger', path: '/fees/ledger', description: 'Transactions, receipts & refunds' },
]

export const FEE_HUB_EXTRAS = FEE_HUB_MODULES.slice(6)

export const FEE_MASTER_DEFINITIONS = {
  categories: {
    key: 'categories',
    label: 'Fee Category',
    labelPlural: 'Fee Categories',
    serviceKey: 'categories',
    bulkUploadKey: 'categoriesBulkUpload',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
      { name: 'category_type', label: 'Type', type: 'select', options: CATEGORY_TYPE_OPTIONS },
      { name: 'ledger_code', label: 'Ledger Code', type: 'text' },
      { name: 'is_recurring', label: 'Recurring', type: 'checkbox' },
      { name: 'is_taxable', label: 'Taxable', type: 'checkbox' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'category_type', header: 'Type' },
      { accessorKey: 'is_active', header: 'Active', cell: ({ getValue }) => (getValue() ? 'Yes' : 'No') },
    ],
  },
  'sub-categories': {
    key: 'sub-categories',
    label: 'Sub Category',
    labelPlural: 'Sub Categories',
    serviceKey: 'subCategories',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
      { name: 'fee_category', label: 'Category ID', type: 'text', required: true },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'fee_category_name', header: 'Category' },
    ],
  },
  formats: {
    key: 'formats',
    label: 'Fee Format',
    labelPlural: 'Fee Formats',
    serviceKey: 'formats',
    bulkUploadKey: 'formatsBulkUpload',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
      { name: 'recurrence', label: 'Recurrence', type: 'select', options: RECURRENCE_OPTIONS },
      { name: 'total_installments', label: 'Installments', type: 'number' },
      { name: 'due_day', label: 'Due Day', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'recurrence', header: 'Recurrence' },
      { accessorKey: 'total_installments', header: 'Installments' },
    ],
  },
  components: {
    key: 'components',
    label: 'Component',
    labelPlural: 'Components',
    serviceKey: 'components',
    bulkUploadKey: 'componentsBulkUpload',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'code', header: 'Code' },
    ],
  },
  heads: {
    key: 'heads',
    label: 'Fee Head',
    labelPlural: 'Fee Heads',
    serviceKey: 'heads',
    bulkUploadKey: 'headsBulkUpload',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
      { name: 'default_amount', label: 'Default Amount', type: 'number', required: true },
      { name: 'category', label: 'Billing Frequency', type: 'select', options: BILLING_FREQ_OPTIONS },
      { name: 'is_optional', label: 'Optional Head', type: 'checkbox' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'default_amount', header: 'Amount' },
      { accessorKey: 'is_optional', header: 'Optional', cell: ({ getValue }) => (getValue() ? 'Yes' : 'No') },
    ],
  },
  'late-fee-rules': {
    key: 'late-fee-rules',
    label: 'Late Fee Rule',
    labelPlural: 'Late Fee Rules',
    serviceKey: 'lateFeeRules',
    listOnly: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true },
      { name: 'frequency', label: 'Frequency', type: 'select', options: LATE_FEE_FREQ },
      { name: 'calculation', label: 'Calculation', type: 'select', options: LATE_FEE_CALC },
      { name: 'amount', label: 'Amount', type: 'number' },
      { name: 'grace_days', label: 'Grace Days', type: 'number' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'frequency', header: 'Frequency' },
      { accessorKey: 'grace_days', header: 'Grace' },
    ],
  },
  'discount-rules': {
    key: 'discount-rules',
    label: 'Discount Rule',
    labelPlural: 'Discount Rules',
    serviceKey: 'discountRules',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
      { name: 'discount_type', label: 'Type', type: 'select', options: DISCOUNT_TYPE_OPTIONS },
      { name: 'discount_percentage', label: 'Percentage', type: 'number' },
      { name: 'discount_amount', label: 'Flat Amount', type: 'number' },
      { name: 'requires_approval', label: 'Requires Approval', type: 'checkbox' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'discount_type', header: 'Type' },
      { accessorKey: 'discount_percentage', header: '%' },
    ],
  },
  'concession-rules': {
    key: 'concession-rules',
    label: 'Concession Rule',
    labelPlural: 'Concession Rules',
    serviceKey: 'concessionRules',
    customForm: true,
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
      { name: 'concession_type', label: 'Type', type: 'select', options: CONCESSION_TYPE_OPTIONS },
      { name: 'apply_scope', label: 'Apply To', type: 'select', options: CONCESSION_APPLY_SCOPE_OPTIONS },
      { name: 'discount_percentage', label: 'Percentage', type: 'number' },
      { name: 'discount_amount', label: 'Flat Amount', type: 'number' },
      { name: 'requires_approval', label: 'Requires Approval', type: 'checkbox' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'concession_type', header: 'Type' },
      { accessorKey: 'apply_scope_label', header: 'Applies To' },
    ],
  },
  counters: {
    key: 'counters',
    label: 'Collection Counter',
    labelPlural: 'Collection Counters',
    serviceKey: 'collectionCounters',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'code', header: 'Code' },
      { accessorKey: 'location', header: 'Location' },
    ],
  },
  transport: {
    key: 'transport',
    label: 'Transport Structure',
    labelPlural: 'Transport Fee Structures',
    serviceKey: 'transportStructures',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
      { name: 'basis', label: 'Basis', type: 'select', options: TRANSPORT_BASIS },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'is_optional', label: 'Optional', type: 'checkbox' },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'basis', header: 'Basis' },
      { accessorKey: 'amount', header: 'Amount' },
    ],
  },
  hostel: {
    key: 'hostel',
    label: 'Hostel Structure',
    labelPlural: 'Hostel Fee Structures',
    serviceKey: 'hostelStructures',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true },
      { name: 'component', label: 'Component', type: 'select', options: HOSTEL_COMPONENT },
      { name: 'room_type', label: 'Room Type', type: 'text' },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'is_active', label: 'Active', type: 'checkbox' },
    ],
    columns: [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'component', header: 'Component' },
      { accessorKey: 'amount', header: 'Amount' },
    ],
  },
}

export function getFeeMasterDefinition(entityKey) {
  return FEE_MASTER_DEFINITIONS[entityKey]
}
