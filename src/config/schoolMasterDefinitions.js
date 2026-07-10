/** School-scoped master definitions (configurable per school). */

const baseFields = (parentType) => {
  const fields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'code', label: 'Code', type: 'text', required: true, readOnlyOnEdit: true, help: 'Lowercase letters, numbers, underscores' },
    { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
    { name: 'sequence', label: 'Sequence', type: 'number' },
    { name: 'is_active', label: 'Active', type: 'checkbox' },
  ]
  if (parentType) {
    fields.splice(3, 0, {
      name: 'parent',
      label: parentType === 'transport_route' ? 'Transport Route' : 'Department',
      type: 'parentSelect',
      parentType,
      required: parentType === 'transport_route',
    })
  }
  return fields
}

const baseColumns = (withParent = false) => {
  const cols = [
    { accessorKey: 'sequence', header: 'Seq' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'code', header: 'Code' },
  ]
  if (withParent) cols.push({ accessorKey: 'parent_name', header: 'Parent' })
  cols.push({
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ getValue }) => (getValue() ? 'Active' : 'Inactive'),
  })
  return cols
}

function def(key, label, labelPlural, parentType = null) {
  return {
    key,
    label,
    labelPlural,
    parentType,
    fields: baseFields(parentType),
    columns: baseColumns(Boolean(parentType)),
  }
}

export const SCHOOL_MASTER_DEFINITIONS = {
  religion: def('religion', 'Religion', 'Religions'),
  caste: def('caste', 'Caste', 'Castes'),
  category: def('category', 'Category', 'Categories'),
  blood_group: def('blood_group', 'Blood Group', 'Blood Groups'),
  gender: def('gender', 'Gender', 'Genders'),
  nationality: def('nationality', 'Nationality', 'Nationalities'),
  mother_tongue: def('mother_tongue', 'Mother Tongue', 'Mother Tongues'),
  occupation: def('occupation', 'Occupation', 'Occupations'),
  relationship: def('relationship', 'Relationship', 'Relationships'),
  transport_route: def('transport_route', 'Transport Route', 'Transport Routes'),
  pickup_point: def('pickup_point', 'Pickup Point', 'Pickup Points', 'transport_route'),
  vehicle_type: def('vehicle_type', 'Vehicle Type', 'Vehicle Types'),
  department: def('department', 'Department', 'Departments'),
  designation: def('designation', 'Designation', 'Designations', 'department'),
  house: def('house', 'House', 'Houses'),
  club: def('club', 'Club', 'Clubs'),
  skill: def('skill', 'Skill', 'Skills'),
  achievement: def('achievement', 'Achievement', 'Achievements'),
  disability: def('disability', 'Disability', 'Disabilities'),
  medical_condition: def('medical_condition', 'Medical Condition', 'Medical Conditions'),
}

export const SCHOOL_MASTER_GROUPS = [
  {
    title: 'Demographics',
    keys: ['religion', 'caste', 'category', 'gender', 'blood_group', 'nationality', 'mother_tongue', 'disability'],
  },
  {
    title: 'People',
    keys: ['occupation', 'relationship', 'department', 'designation'],
  },
  {
    title: 'Student Life',
    keys: ['house', 'club', 'skill', 'achievement'],
  },
  {
    title: 'Transport',
    keys: ['transport_route', 'pickup_point', 'vehicle_type'],
  },
  {
    title: 'Health',
    keys: ['medical_condition'],
  },
]
