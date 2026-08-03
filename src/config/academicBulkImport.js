/** Bulk-import column definitions and sample rows per academic entity. */

const ACTIVE = { key: 'is_active', header: 'is_active', type: 'boolean', default: true }

const NAME_CODE = [
  { key: 'name', header: 'name', required: true },
  { key: 'code', header: 'code', required: true },
]

const DESC = { key: 'description', header: 'description' }

export const ACADEMIC_BULK_IMPORT = {
  terms: {
    scopeYear: true,
    columns: [
      ...NAME_CODE,
      { key: 'start_date', header: 'start_date', type: 'date', required: true },
      { key: 'end_date', header: 'end_date', type: 'date', required: true },
      { key: 'sequence', header: 'sequence', type: 'number', default: 0 },
      { key: 'term_type', header: 'term_type', default: 'term' },
      { key: 'weightage', header: 'weightage', type: 'number', default: 0 },
      DESC,
      { key: 'is_current', header: 'is_current', type: 'boolean', default: false },
      ACTIVE,
    ],
    exampleRows: [
      {
        name: 'Term 1',
        code: 'term_1',
        start_date: '01-04-2026',
        end_date: '30-09-2026',
        sequence: '1',
        term_type: 'semester',
        weightage: '50',
        description: '',
        is_current: 'yes',
        is_active: 'yes',
      },
    ],
  },
  curriculums: {
    scopeYear: true,
    fkResolve: 'curriculums',
    columns: [
      ...NAME_CODE,
      { key: 'class_code', header: 'class_code', required: true },
      { key: 'board_code', header: 'board_code' },
      { key: 'stream_code', header: 'stream_code' },
      { key: 'curriculum_type', header: 'curriculum_type', default: 'custom' },
      DESC,
      ACTIVE,
    ],
    exampleRows: [
      {
        name: 'Grade 10 CBSE',
        code: 'grade_10_cbse',
        class_code: 'grade_10',
        board_code: 'cbse',
        stream_code: '',
        curriculum_type: 'cbse',
        description: '',
        is_active: 'yes',
      },
    ],
  },
  'curriculum-subjects': {
    scopeYear: false,
    fkResolve: 'curriculum-subjects',
    columns: [
      { key: 'curriculum_code', header: 'curriculum_code', required: true },
      { key: 'subject_code', header: 'subject_code', required: true },
      { key: 'is_mandatory', header: 'is_mandatory', type: 'boolean', default: true },
      { key: 'weekly_periods', header: 'weekly_periods', type: 'number', default: 0 },
      ACTIVE,
    ],
    exampleRows: [
      {
        curriculum_code: 'grade_10_cbse',
        subject_code: 'math',
        is_mandatory: 'yes',
        weekly_periods: '5',
        is_active: 'yes',
      },
    ],
  },
  'elective-subjects': {
    scopeYear: false,
    fkResolve: 'elective-subjects',
    columns: [
      { key: 'curriculum_code', header: 'curriculum_code', required: true },
      { key: 'subject_code', header: 'subject_code', required: true },
      { key: 'subject_group_code', header: 'subject_group_code' },
      { key: 'min_pick', header: 'min_pick', type: 'number', default: 1 },
      { key: 'max_pick', header: 'max_pick', type: 'number', default: 1 },
      ACTIVE,
    ],
    exampleRows: [
      {
        curriculum_code: 'grade_10_cbse',
        subject_code: 'computer',
        subject_group_code: 'electives',
        min_pick: '1',
        max_pick: '1',
        is_active: 'yes',
      },
    ],
  },
  'class-teachers': {
    scopeYear: true,
    fkResolve: 'class-teachers',
    columns: [
      { key: 'class_code', header: 'class_code', required: true },
      { key: 'section_code', header: 'section_code', required: true },
      { key: 'teacher_email', header: 'teacher_email', required: true },
      { key: 'is_primary', header: 'is_primary', type: 'boolean', default: true },
      ACTIVE,
    ],
    exampleRows: [
      {
        class_code: 'grade_1',
        section_code: 'a',
        teacher_email: 'teacher@school.com',
        is_primary: 'yes',
        is_active: 'yes',
      },
    ],
  },
  'calendar-events': {
    scopeYear: true,
    columns: [
      ...NAME_CODE,
      { key: 'event_type', header: 'event_type', default: 'event' },
      { key: 'start_date', header: 'start_date', type: 'date', required: true },
      { key: 'end_date', header: 'end_date', type: 'date' },
      { key: 'is_all_day', header: 'is_all_day', type: 'boolean', default: true },
      DESC,
      ACTIVE,
    ],
    exampleRows: [
      {
        name: 'Mid Term Exams',
        code: 'mid_term_exams',
        event_type: 'exam',
        start_date: '2026-08-01',
        end_date: '2026-08-15',
        is_all_day: 'yes',
        description: '',
        is_active: 'yes',
      },
    ],
  },
  'class-timings': {
    scopeYear: true,
    columns: [
      ...NAME_CODE,
      { key: 'shift_start', header: 'shift_start', required: true },
      { key: 'shift_end', header: 'shift_end', required: true },
      DESC,
      ACTIVE,
    ],
    exampleRows: [
      {
        name: 'Morning Shift',
        code: 'morning',
        shift_start: '08:00',
        shift_end: '14:00',
        description: '',
        is_active: 'yes',
      },
    ],
  },
  periods: {
    scopeYear: true,
    fkResolve: 'periods',
    columns: [
      { key: 'class_timing_code', header: 'class_timing_code', required: true },
      { key: 'period_number', header: 'period_number', type: 'number', required: true },
      { key: 'name', header: 'name', required: true },
      { key: 'start_time', header: 'start_time', required: true },
      { key: 'end_time', header: 'end_time', required: true },
      ACTIVE,
    ],
    exampleRows: [
      {
        class_timing_code: 'morning',
        period_number: '1',
        name: 'Period 1',
        start_time: '08:00',
        end_time: '08:45',
        is_active: 'yes',
      },
    ],
  },
  'working-days': {
    scopeYear: true,
    columns: [
      { key: 'weekday', header: 'weekday', type: 'number', required: true },
      { key: 'is_working', header: 'is_working', type: 'boolean', default: true },
      ACTIVE,
    ],
    exampleRows: [
      { weekday: '0', is_working: 'yes', is_active: 'yes' },
      { weekday: '1', is_working: 'yes', is_active: 'yes' },
    ],
  },
  holidays: {
    scopeYear: true,
    columns: [
      ...NAME_CODE,
      { key: 'holiday_date', header: 'holiday_date', type: 'date', required: true },
      { key: 'holiday_type', header: 'holiday_type', default: 'public' },
      DESC,
      ACTIVE,
    ],
    exampleRows: [
      {
        name: 'Independence Day',
        code: 'independence_day',
        holiday_date: '2026-08-15',
        holiday_type: 'public',
        description: '',
        is_active: 'yes',
      },
    ],
  },
  'grading-schemes': {
    scopeYear: false,
    columns: [
      ...NAME_CODE,
      { key: 'result_type', header: 'result_type', default: 'marks' },
      { key: 'passing_marks', header: 'passing_marks', type: 'number', default: 33 },
      { key: 'is_default', header: 'is_default', type: 'boolean', default: false },
      ACTIVE,
    ],
    exampleRows: [
      {
        name: 'Standard Grading',
        code: 'standard',
        result_type: 'marks',
        passing_marks: '33',
        is_default: 'yes',
        is_active: 'yes',
      },
    ],
  },
  'assessment-categories': {
    scopeYear: false,
    columns: [
      ...NAME_CODE,
      { key: 'weightage', header: 'weightage', type: 'number', default: 0 },
      DESC,
      ACTIVE,
    ],
    exampleRows: [
      {
        name: 'Formative',
        code: 'formative',
        weightage: '40',
        description: '',
        is_active: 'yes',
      },
    ],
  },
  'exam-types': {
    scopeYear: false,
    fkResolve: 'exam-types',
    columns: [
      ...NAME_CODE,
      { key: 'category_code', header: 'category_code' },
      { key: 'weightage', header: 'weightage', type: 'number', default: 0 },
      { key: 'max_marks', header: 'max_marks', type: 'number', default: 100 },
      DESC,
      ACTIVE,
    ],
    exampleRows: [
      {
        name: 'Unit Test',
        code: 'unit_test',
        category_code: 'formative',
        weightage: '10',
        max_marks: '25',
        description: '',
        is_active: 'yes',
      },
    ],
  },
  policies: {
    scopeYear: false,
    columns: [
      { key: 'kind', header: 'kind', default: 'passing' },
      ...NAME_CODE,
      DESC,
      { key: 'is_default', header: 'is_default', type: 'boolean', default: false },
      ACTIVE,
    ],
    exampleRows: [
      {
        kind: 'passing',
        name: 'Default Passing Policy',
        code: 'default_passing',
        description: '',
        is_default: 'yes',
        is_active: 'yes',
      },
    ],
  },
  rooms: {
    scopeYear: false,
    columns: [
      ...NAME_CODE,
      { key: 'room_type', header: 'room_type', default: 'classroom' },
      { key: 'capacity', header: 'capacity', type: 'number', default: 40 },
      { key: 'building', header: 'building' },
      { key: 'floor', header: 'floor' },
      ACTIVE,
    ],
    exampleRows: [
      {
        name: 'Room 101',
        code: 'room_101',
        room_type: 'classroom',
        capacity: '40',
        building: 'Main Block',
        floor: '1',
        is_active: 'yes',
      },
    ],
  },
  'class-section-subjects': {
    scopeYear: true,
    fkResolve: 'class-section-subjects',
    columns: [
      { key: 'class_code', header: 'class_code', required: true },
      { key: 'section_code', header: 'section_code', required: true },
      { key: 'subject_code', header: 'subject_code', required: true },
      { key: 'teacher_email', header: 'teacher_email' },
      { key: 'weekly_periods', header: 'weekly_periods', type: 'number', default: 0 },
      { key: 'is_elective', header: 'is_elective', type: 'boolean', default: false },
      ACTIVE,
    ],
    exampleRows: [
      {
        class_code: 'grade_1',
        section_code: 'a',
        subject_code: 'math',
        teacher_email: 'teacher@school.com',
        weekly_periods: '5',
        is_elective: 'no',
        is_active: 'yes',
      },
    ],
  },
}

export function getAcademicBulkImportConfig(entityKey) {
  return (
    ACADEMIC_BULK_IMPORT[entityKey] || {
      scopeYear: false,
      columns: [
        { key: 'name', header: 'name', required: true },
        { key: 'code', header: 'code', required: true },
        ACTIVE,
      ],
      exampleRows: [{ name: 'Sample', code: 'sample', is_active: 'yes' }],
    }
  )
}

export function academicEntitySupportsBulkImport(entityKey) {
  return Boolean(ACADEMIC_BULK_IMPORT[entityKey])
}
