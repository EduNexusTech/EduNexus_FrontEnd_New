/** Bulk-import column definitions and sample rows per master type. */

import {
  SUBJECT_TYPE_ALIASES,
  SUBJECT_TYPE_VALUES,
  formatChoicesHint,
  normalizeChoiceValue,
} from '@/config/masterFieldChoices'

export const LOCATION_MASTER_KEYS = new Set(['countries', 'states', 'cities'])

const BASE = [
  { key: 'name', header: 'name', required: true },
  { key: 'code', header: 'code', required: true },
  { key: 'description', header: 'description' },
  { key: 'sequence', header: 'sequence', type: 'number', default: 0 },
  { key: 'is_active', header: 'is_active', type: 'boolean', default: true },
]

export const MASTER_BULK_IMPORT = {
  countries: {
    columns: BASE,
    exampleRows: [
      {
        name: 'India',
        code: 'in',
        description: 'Republic of India',
        sequence: '1',
        is_active: 'yes',
      },
    ],
    scopeSchool: false,
    scopeOrganization: true,
    superAdminOnly: true,
  },
  states: {
    columns: [
      { key: 'country_code', header: 'country_code', required: true },
      ...BASE,
    ],
    exampleRows: [
      {
        country_code: 'in',
        name: 'Maharashtra',
        code: 'mh',
        description: '',
        sequence: '1',
        is_active: 'yes',
      },
    ],
    scopeSchool: false,
    scopeOrganization: true,
    superAdminOnly: true,
    fkResolve: 'states',
  },
  cities: {
    columns: [
      { key: 'state_code', header: 'state_code', required: true },
      ...BASE,
    ],
    exampleRows: [
      {
        state_code: 'mh',
        name: 'Mumbai',
        code: 'mumbai',
        description: '',
        sequence: '1',
        is_active: 'yes',
      },
    ],
    scopeSchool: false,
    scopeOrganization: true,
    superAdminOnly: true,
    fkResolve: 'cities',
  },
  boards: {
    columns: BASE,
    exampleRows: [
      { name: 'CBSE', code: 'cbse', description: 'Central Board', sequence: '1', is_active: 'yes' },
    ],
    scopeSchool: true,
  },
  streams: {
    columns: BASE,
    exampleRows: [
      { name: 'Science', code: 'science', description: '', sequence: '1', is_active: 'yes' },
    ],
    scopeSchool: true,
  },
  subjects: {
    columns: [
      ...BASE.slice(0, 2),
      {
        key: 'subject_type',
        header: 'subject_type',
        type: 'choice',
        default: 'core',
        choices: SUBJECT_TYPE_VALUES,
        normalizeChoice: (raw) =>
          normalizeChoiceValue(raw, SUBJECT_TYPE_VALUES, SUBJECT_TYPE_ALIASES),
        hint: formatChoicesHint(SUBJECT_TYPE_VALUES),
      },
      ...BASE.slice(2),
    ],
    exampleRows: [
      {
        name: 'Mathematics',
        code: 'math',
        subject_type: 'core',
        description: '',
        sequence: '1',
        is_active: 'yes',
      },
    ],
    scopeSchool: true,
  },
  'subject-groups': {
    columns: BASE,
    exampleRows: [
      { name: 'Core Group', code: 'core_grp', description: '', sequence: '1', is_active: 'yes' },
    ],
    scopeSchool: true,
  },
  departments: {
    columns: BASE,
    exampleRows: [
      { name: 'Administration', code: 'admin', description: '', sequence: '1', is_active: 'yes' },
    ],
    scopeSchool: true,
  },
  designations: {
    columns: [
      { key: 'department_code', header: 'department_code' },
      ...BASE,
    ],
    exampleRows: [
      {
        department_code: 'admin',
        name: 'Principal',
        code: 'principal',
        description: '',
        sequence: '1',
        is_active: 'yes',
      },
    ],
    scopeSchool: true,
    fkResolve: 'designations',
  },
  categories: {
    columns: [
      ...BASE.slice(0, 2),
      { key: 'category_type', header: 'category_type', default: 'general' },
      ...BASE.slice(2),
    ],
    exampleRows: [
      {
        name: 'Library Books',
        code: 'library_books',
        category_type: 'library',
        description: 'Library catalog categories',
        sequence: '1',
        is_active: 'yes',
      },
    ],
    scopeSchool: false,
  },
  classes: {
    columns: [
      { key: 'board_code', header: 'board_code' },
      ...BASE,
    ],
    exampleRows: [
      {
        board_code: 'cbse',
        name: 'Grade 1',
        code: 'grade_1',
        description: '',
        sequence: '1',
        is_active: 'yes',
      },
    ],
    scopeSchool: true,
    fkResolve: 'classes',
  },
  sections: {
    columns: [
      { key: 'class_code', header: 'class_code', required: true },
      ...BASE.slice(0, 2),
      { key: 'capacity', header: 'capacity', type: 'number', default: 40 },
      ...BASE.slice(2),
    ],
    exampleRows: [
      {
        class_code: 'grade_1',
        name: 'Section A',
        code: 'a',
        capacity: '40',
        description: '',
        sequence: '1',
        is_active: 'yes',
      },
    ],
    scopeSchool: true,
    fkResolve: 'sections',
  },
}

export function getMasterBulkImportConfig(masterKey) {
  return MASTER_BULK_IMPORT[masterKey] || {
    columns: BASE,
    exampleRows: [
      { name: 'Sample', code: 'sample', description: '', sequence: '1', is_active: 'yes' },
    ],
    scopeSchool: true,
  }
}
