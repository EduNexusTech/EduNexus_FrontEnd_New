import { API_ENDPOINTS } from '@/config/endpoints'
import {
  apiGet,
  apiPost,
  apiPatch,
  apiPostForm,
  apiPatchForm,
  apiDelete,
  apiGetPaginated,
  apiGetBlob,
  buildQuery,
} from './client'

export const authService = {
  login: (payload) => apiPost(API_ENDPOINTS.AUTH.LOGIN, payload, { skipAuthRefresh: true }),
  logout: (refresh) => apiPost(API_ENDPOINTS.AUTH.LOGOUT, { refresh }),
  profile: () => apiGet(API_ENDPOINTS.AUTH.PROFILE),
  changePassword: (payload) => apiPost(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, payload),
}

export const dashboardService = {
  superAdmin: (params) => apiGet(API_ENDPOINTS.DASHBOARD.SUPER_ADMIN, params),
  schoolAdmin: (params) => apiGet(API_ENDPOINTS.DASHBOARD.SCHOOL_ADMIN, params),
}

export const organizationService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.ORGANIZATIONS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.ORGANIZATIONS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.ORGANIZATIONS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.ORGANIZATIONS.DETAIL(id)),
  activate: (id) => apiPost(API_ENDPOINTS.ORGANIZATIONS.ACTIVATE(id)),
  deactivate: (id) => apiPost(API_ENDPOINTS.ORGANIZATIONS.DEACTIVATE(id)),
}

export const schoolService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.SCHOOLS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.SCHOOLS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.SCHOOLS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.SCHOOLS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.SCHOOLS.DETAIL(id)),
  getProfile: (id) => apiGet(id ? API_ENDPOINTS.SCHOOLS.PROFILE(id) : API_ENDPOINTS.SCHOOL_PROFILE),
  updateProfile: (id, data) => {
    const isForm = typeof FormData !== 'undefined' && data instanceof FormData
    const url = id ? API_ENDPOINTS.SCHOOLS.PROFILE(id) : API_ENDPOINTS.SCHOOL_PROFILE
    return isForm ? apiPatchForm(url, data) : apiPatch(url, data)
  },
  regenerateQr: (id) => apiPost(API_ENDPOINTS.SCHOOLS.PROFILE_REGENERATE_QR(id)),
}

export const userService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.USERS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.USERS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.USERS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.USERS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.USERS.DETAIL(id)),
  activate: (id) => apiPost(API_ENDPOINTS.USERS.ACTIVATE(id)),
  deactivate: (id) => apiPost(API_ENDPOINTS.USERS.DEACTIVATE(id)),
  resetPassword: (id, newPassword) =>
    apiPost(API_ENDPOINTS.USERS.RESET_PASSWORD(id), { new_password: newPassword }),
  bulkAction: (userIds, action) =>
    apiPost(API_ENDPOINTS.USERS.BULK_ACTION, { user_ids: userIds, action }),
  export: (params) => apiGetBlob(API_ENDPOINTS.USERS.EXPORT, params),
}

function schoolUserWrite(url, data, method = 'post') {
  const isForm = typeof FormData !== 'undefined' && data instanceof FormData
  if (method === 'post') {
    return isForm ? apiPostForm(url, data) : apiPost(url, data)
  }
  return isForm ? apiPatchForm(url, data) : apiPatch(url, data)
}

export const schoolUserService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.SCHOOL_USERS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.SCHOOL_USERS.DETAIL(id)),
  create: (data) => schoolUserWrite(API_ENDPOINTS.SCHOOL_USERS.LIST, data, 'post'),
  update: (id, data) => schoolUserWrite(API_ENDPOINTS.SCHOOL_USERS.DETAIL(id), data, 'patch'),
  delete: (id) => apiDelete(API_ENDPOINTS.SCHOOL_USERS.DETAIL(id)),
  activate: (id) => apiPost(API_ENDPOINTS.SCHOOL_USERS.ACTIVATE(id)),
  deactivate: (id) => apiPost(API_ENDPOINTS.SCHOOL_USERS.DEACTIVATE(id)),
  resetPassword: (id, payload = {}) =>
    apiPost(API_ENDPOINTS.SCHOOL_USERS.RESET_PASSWORD(id), payload),
  sendCredentials: (id, payload = {}) =>
    apiPost(API_ENDPOINTS.SCHOOL_USERS.SEND_CREDENTIALS(id), payload),
  loginHistory: (id) => apiGet(API_ENDPOINTS.SCHOOL_USERS.LOGIN_HISTORY(id)),
  devices: (id) => apiGet(API_ENDPOINTS.SCHOOL_USERS.DEVICES(id)),
  staffRoles: () => apiGet(API_ENDPOINTS.SCHOOL_USERS.STAFF_ROLES),
}

export const roleService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.ROLES.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.ROLES.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.ROLES.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.ROLES.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.ROLES.DETAIL(id)),
  getPermissions: (id) => apiGet(API_ENDPOINTS.ROLES.PERMISSIONS(id)),
  syncPermissions: (id, permissionIds) =>
    apiPost(API_ENDPOINTS.ROLES.SYNC_PERMISSIONS(id), { permission_ids: permissionIds }),
  getMenus: (id) => apiGet(API_ENDPOINTS.ROLES.MENUS(id)),
  syncMenus: (id, menuIds) => apiPost(API_ENDPOINTS.ROLES.SYNC_MENUS(id), { menu_ids: menuIds }),
}

export const permissionService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.PERMISSIONS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.PERMISSIONS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.PERMISSIONS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.PERMISSIONS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.PERMISSIONS.DETAIL(id)),
  matrix: (params) => apiGet(API_ENDPOINTS.PERMISSIONS.MATRIX, params),
}

export const menuService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.MENUS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.MENUS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.MENUS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.MENUS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.MENUS.DETAIL(id)),
  myMenus: () => apiGet(API_ENDPOINTS.MENUS.MY_MENUS),
  tree: (params) => apiGet(API_ENDPOINTS.MENUS.TREE, params),
  reorder: (items) => apiPost(API_ENDPOINTS.MENUS.REORDER, { items }),
}

export const moduleService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.MODULES.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.MODULES.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.MODULES.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.MODULES.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.MODULES.DETAIL(id)),
  reorder: (items) => apiPost(API_ENDPOINTS.MODULES.REORDER, { items }),
}

export const membershipService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.MEMBERSHIPS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.MEMBERSHIPS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.MEMBERSHIPS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.MEMBERSHIPS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.MEMBERSHIPS.DETAIL(id)),
}

export const userRoleService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.USER_ROLES.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.USER_ROLES.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.USER_ROLES.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.USER_ROLES.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.USER_ROLES.DETAIL(id)),
}

export const auditLogService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.AUDIT_LOGS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.AUDIT_LOGS.DETAIL(id)),
  filterOptions: () => apiGet(API_ENDPOINTS.AUDIT_LOGS.FILTER_OPTIONS),
}

export const settingsService = {
  get: (section) => apiGet(API_ENDPOINTS.SETTINGS.SECTION(section)),
  update: (section, data) => apiPatch(API_ENDPOINTS.SETTINGS.SECTION(section), data),
}

export const notificationService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.NOTIFICATIONS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.NOTIFICATIONS.DETAIL(id)),
  markRead: (id) => apiPost(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),
  markAllRead: () => apiPost(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
  unreadCount: () => apiGet(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT),
}

export const nexusMailService = {
  send: (data) => apiPost(API_ENDPOINTS.NEXUS_MAIL.SEND, data),
}

export function createMasterService(apiPath) {
  const detail = (id) => (apiPath.endsWith('/') ? `${apiPath}${id}/` : `${apiPath}/${id}/`)
  return {
    list: (params) => apiGetPaginated(apiPath, params),
    get: (id) => apiGet(detail(id)),
    create: (data) => apiPost(apiPath, data),
    update: (id, data) => apiPatch(detail(id), data),
    delete: (id) => apiDelete(detail(id)),
  }
}

export function createAcademicService(apiPath) {
  const detail = (id) => (apiPath.endsWith('/') ? `${apiPath}${id}/` : `${apiPath}/${id}/`)
  return {
    list: (params) => apiGetPaginated(apiPath, params),
    get: (id) => apiGet(detail(id)),
    create: (data) => apiPost(apiPath, data),
    update: (id, data) => apiPatch(detail(id), data),
    delete: (id) => apiDelete(detail(id)),
    bulkUpload: (items) => apiPost(`${apiPath}bulk-upload/`, { items }),
    bulkUpdate: (items) => apiPatch(`${apiPath}bulk-update/`, { items }),
  }
}

export const masterServices = {
  countries: createMasterService(API_ENDPOINTS.MASTERS.COUNTRIES),
  states: createMasterService(API_ENDPOINTS.MASTERS.STATES),
  cities: createMasterService(API_ENDPOINTS.MASTERS.CITIES),
  boards: createMasterService(API_ENDPOINTS.MASTERS.BOARDS),
  classes: createMasterService(API_ENDPOINTS.MASTERS.CLASSES),
  sections: createMasterService(API_ENDPOINTS.MASTERS.SECTIONS),
  subjects: createMasterService(API_ENDPOINTS.MASTERS.SUBJECTS),
  streams: createMasterService(API_ENDPOINTS.MASTERS.STREAMS),
  subjectGroups: createMasterService(API_ENDPOINTS.MASTERS.SUBJECT_GROUPS),
  departments: createMasterService(API_ENDPOINTS.MASTERS.DEPARTMENTS),
  designations: createMasterService(API_ENDPOINTS.MASTERS.DESIGNATIONS),
  categories: createMasterService(API_ENDPOINTS.MASTERS.CATEGORIES),
  academicYears: createMasterService(API_ENDPOINTS.ACADEMIC_YEARS.LIST),
}

export const academicServices = {
  academicYears: createMasterService(API_ENDPOINTS.ACADEMIC_YEARS.LIST),
  terms: createAcademicService(API_ENDPOINTS.ACADEMICS.TERMS),
  classSections: createAcademicService(API_ENDPOINTS.ACADEMICS.CLASS_SECTIONS),
  curriculums: createAcademicService(API_ENDPOINTS.ACADEMICS.CURRICULUMS),
  curriculumSubjects: createAcademicService(API_ENDPOINTS.ACADEMICS.CURRICULUM_SUBJECTS),
  electiveSubjects: createAcademicService(API_ENDPOINTS.ACADEMICS.ELECTIVE_SUBJECTS),
  classTeachers: createAcademicService(API_ENDPOINTS.ACADEMICS.CLASS_TEACHERS),
  calendarEvents: createAcademicService(API_ENDPOINTS.ACADEMICS.CALENDAR_EVENTS),
  classTimings: createAcademicService(API_ENDPOINTS.ACADEMICS.CLASS_TIMINGS),
  periods: createAcademicService(API_ENDPOINTS.ACADEMICS.PERIODS),
  workingDays: createAcademicService(API_ENDPOINTS.ACADEMICS.WORKING_DAYS),
  holidays: createAcademicService(API_ENDPOINTS.ACADEMICS.HOLIDAYS),
}
