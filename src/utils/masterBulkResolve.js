import { unwrapList } from '@/api/client'
import { masterServices } from '@/api/services'

async function fetchCodeMap(service, listParams, listConfig) {
  const data = await service.list({ page_size: 5000, ...listParams }, listConfig)
  const { results } = unwrapList(data)
  const map = new Map()
  ;(results || []).forEach((row) => {
    const code = String(row.code || '').trim().toLowerCase()
    if (code && row.id) map.set(code, row.id)
  })
  return map
}

function requireCode(map, code, label, rowIndex) {
  const normalized = String(code || '').trim().toLowerCase()
  if (!normalized) {
    throw new Error(`Row ${rowIndex + 2}: ${label} is required.`)
  }
  const id = map.get(normalized)
  if (!id) {
    throw new Error(`Row ${rowIndex + 2}: unknown ${label} "${code}". Import the parent master first.`)
  }
  return id
}

/**
 * Resolve CSV code columns (country_code, state_code, etc.) to API FK ids.
 */
export async function resolveMasterImportItems(masterKey, items, { listParams, listRequestConfig } = {}) {
  const config = { listParams, listRequestConfig }
  const fk = MASTER_FK_RESOLVERS[masterKey]
  if (!fk) return items
  return fk(items, config)
}

const MASTER_FK_RESOLVERS = {
  async states(items, { listParams, listRequestConfig }) {
    const countryMap = await fetchCodeMap(masterServices.countries, listParams, listRequestConfig)
    return items.map((item, index) => {
      const { country_code, country, ...rest } = item
      return {
        ...rest,
        country: requireCode(countryMap, country_code || country, 'country_code', index),
      }
    })
  },

  async cities(items, { listParams, listRequestConfig }) {
    const stateMap = await fetchCodeMap(masterServices.states, listParams, listRequestConfig)
    return items.map((item, index) => {
      const { state_code, state, ...rest } = item
      return {
        ...rest,
        state: requireCode(stateMap, state_code || state, 'state_code', index),
      }
    })
  },

  async designations(items, { listParams, listRequestConfig }) {
    const schoolId = items[0]?.school_id
    const deptParams = {
      ...listParams,
      page_size: 5000,
      ...(schoolId ? { school: schoolId } : {}),
    }
    const deptMap = await fetchCodeMap(masterServices.departments, deptParams, listRequestConfig)
    return items.map((item, index) => {
      const { department_code, department, ...rest } = item
      if (!department_code && !department) return rest
      return {
        ...rest,
        department: requireCode(deptMap, department_code || department, 'department_code', index),
      }
    })
  },

  async classes(items, { listParams, listRequestConfig }) {
    const boardMap = await fetchCodeMap(masterServices.boards, listParams, listRequestConfig)
    return items.map((item, index) => {
      const { board_code, board, ...rest } = item
      if (!board_code && !board) return rest
      return {
        ...rest,
        board: requireCode(boardMap, board_code || board, 'board_code', index),
      }
    })
  },

  async sections(items, { listParams, listRequestConfig }) {
    const classParams = { ...listParams, page_size: 5000 }
    const classMap = await fetchCodeMap(masterServices.classes, classParams, listRequestConfig)
    return items.map((item, index) => {
      const { class_code, school_class, ...rest } = item
      return {
        ...rest,
        school_class: requireCode(classMap, class_code || school_class, 'class_code', index),
      }
    })
  },
}
