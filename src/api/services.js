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
  uploadDocuments: (id, formData) => apiPostForm(API_ENDPOINTS.ORGANIZATIONS.UPLOAD_DOCUMENTS(id), formData),
  deleteDocument: (id, documentId) => apiDelete(API_ENDPOINTS.ORGANIZATIONS.DELETE_DOCUMENT(id, documentId)),
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
  uploadDocuments: (id, formData) => apiPostForm(API_ENDPOINTS.SCHOOLS.UPLOAD_DOCUMENTS(id), formData),
  deleteDocument: (id, documentId) => apiDelete(API_ENDPOINTS.SCHOOLS.DELETE_DOCUMENT(id, documentId)),
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

export const admissionService = {
  setup: {
    list: (params) => apiGet(API_ENDPOINTS.ADMISSIONS.SETUP, params),
    get: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.SETUP_DETAIL(id)),
    create: (data) => apiPost(API_ENDPOINTS.ADMISSIONS.SETUP, data),
    update: (id, data) => apiPatch(API_ENDPOINTS.ADMISSIONS.SETUP_DETAIL(id), data),
    delete: (id) => apiDelete(API_ENDPOINTS.ADMISSIONS.SETUP_DETAIL(id)),
    getEmailSettings: () => apiGet(API_ENDPOINTS.ADMISSIONS.SETUP_EMAIL),
    updateEmailSettings: (data) => apiPatch(API_ENDPOINTS.ADMISSIONS.SETUP_EMAIL, data),
  },
  leads: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.ADMISSIONS.LEADS, params),
    get: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.LEAD_DETAIL(id)),
    create: (data) => apiPost(API_ENDPOINTS.ADMISSIONS.LEADS, data),
    update: (id, data) => apiPatch(API_ENDPOINTS.ADMISSIONS.LEAD_DETAIL(id), data),
    delete: (id) => apiDelete(API_ENDPOINTS.ADMISSIONS.LEAD_DETAIL(id)),
    convert: (id) => apiPost(API_ENDPOINTS.ADMISSIONS.LEAD_CONVERT(id)),
    followUps: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.LEAD_FOLLOW_UPS(id)),
    addFollowUp: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.LEAD_FOLLOW_UPS(id), data),
  },
  applications: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.ADMISSIONS.APPLICATIONS, params),
    get: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.APPLICATION_DETAIL(id)),
    create: (data) => apiPost(API_ENDPOINTS.ADMISSIONS.APPLICATIONS, data),
    update: (id, data) => apiPatch(API_ENDPOINTS.ADMISSIONS.APPLICATION_DETAIL(id), data),
    delete: (id) => apiDelete(API_ENDPOINTS.ADMISSIONS.APPLICATION_DETAIL(id)),
    pipelineStats: () => apiGet(API_ENDPOINTS.ADMISSIONS.PIPELINE_STATS),
    submitApplication: (id) => apiPost(API_ENDPOINTS.ADMISSIONS.SUBMIT_APPLICATION(id)),
    uploadDocument: (id, formData) => apiPostForm(API_ENDPOINTS.ADMISSIONS.UPLOAD_DOCUMENT(id), formData),
    verifyDocuments: (id, payload = {}) => apiPost(API_ENDPOINTS.ADMISSIONS.VERIFY_DOCUMENTS(id), payload),
    entranceTest: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.ENTRANCE_TEST(id), data),
    interview: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.INTERVIEW(id), data),
    submitApproval: (id) => apiPost(API_ENDPOINTS.ADMISSIONS.SUBMIT_APPROVAL(id)),
    approve: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.APPROVE(id), data),
    reject: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.REJECT(id), data),
    collectFee: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.COLLECT_FEE(id), data),
    confirm: (id) => apiPost(API_ENDPOINTS.ADMISSIONS.CONFIRM(id)),
    enroll: (id, data = {}) => apiPost(API_ENDPOINTS.ADMISSIONS.ENROLL(id), data),
    receipt: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.RECEIPT(id)),
    followUps: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.FOLLOW_UPS(id)),
    addFollowUp: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.FOLLOW_UPS(id), data),
  },
}

export const studentService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.STUDENTS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.STUDENTS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.STUDENTS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.STUDENTS.DETAIL(id)),
  bulkImport: (items) => apiPost(API_ENDPOINTS.STUDENTS.BULK_IMPORT, { items }),
  export: (params) => apiGetBlob(API_ENDPOINTS.STUDENTS.EXPORT, params),
  regenerateQr: (id) => apiPost(API_ENDPOINTS.STUDENTS.REGENERATE_QR(id)),
  idCard: (id) => apiGet(API_ENDPOINTS.STUDENTS.ID_CARD(id)),
  updateStatus: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.UPDATE_STATUS(id), data),
  updateTransport: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.TRANSPORT(id), data),
  updateHostel: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.HOSTEL(id), data),
  updateMedical: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.MEDICAL(id), data),
  uploadDocument: (id, formData) => apiPostForm(API_ENDPOINTS.STUDENTS.UPLOAD_DOCUMENT(id), formData),
  addAchievement: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.ACHIEVEMENTS(id), data),
  addDiscipline: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.DISCIPLINE(id), data),
  addSibling: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.SIBLINGS(id), data),
  promote: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.PROMOTE(id), data),
}

export const teacherService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.TEACHERS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.TEACHERS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.TEACHERS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.TEACHERS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.TEACHERS.DETAIL(id)),
  export: (params) => apiGetBlob(API_ENDPOINTS.TEACHERS.EXPORT, params),
  sendCredentials: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.SEND_CREDENTIALS(id), data),
  addQualification: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.QUALIFICATIONS(id), data),
  addExperience: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.EXPERIENCE(id), data),
  assignSubject: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.ASSIGN_SUBJECT(id), data),
  assignClassTeacher: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.CLASS_TEACHER(id), data),
  recordAttendance: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.ATTENDANCE(id), data),
  requestLeave: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.LEAVE(id), data),
  approveLeave: (id, leaveId) => apiPost(API_ENDPOINTS.TEACHERS.APPROVE_LEAVE(id, leaveId)),
  updatePayroll: (id, data) => apiPatch(API_ENDPOINTS.TEACHERS.PAYROLL(id), data),
  uploadDocument: (id, formData) => apiPostForm(API_ENDPOINTS.TEACHERS.UPLOAD_DOCUMENT(id), formData),
  addCertificate: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.CERTIFICATES(id), data),
  addTimetable: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.TIMETABLE(id), data),
  addLessonPlan: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.LESSON_PLANS(id), data),
  addHomework: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.HOMEWORK(id), data),
  addOnlineClass: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.ONLINE_CLASSES(id), data),
  addPerformanceReview: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.PERFORMANCE_REVIEWS(id), data),
}

export const staffService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.STAFF.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.STAFF.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.STAFF.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.STAFF.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.STAFF.DETAIL(id)),
  export: (params) => apiGetBlob(API_ENDPOINTS.STAFF.EXPORT, params),
  sendCredentials: (id, data) => apiPost(API_ENDPOINTS.STAFF.SEND_CREDENTIALS(id), data),
  resetPassword: (id, data) => apiPost(API_ENDPOINTS.STAFF.RESET_PASSWORD(id), data),
  updateEmergencyContact: (id, data) => apiPatch(API_ENDPOINTS.STAFF.EMERGENCY_CONTACT(id), data),
  addExperience: (id, data) => apiPost(API_ENDPOINTS.STAFF.EXPERIENCE(id), data),
  addSkill: (id, data) => apiPost(API_ENDPOINTS.STAFF.SKILLS(id), data),
  addShift: (id, data) => apiPost(API_ENDPOINTS.STAFF.SHIFT(id), data),
  recordAttendance: (id, data) => apiPost(API_ENDPOINTS.STAFF.ATTENDANCE(id), data),
  requestLeave: (id, data) => apiPost(API_ENDPOINTS.STAFF.LEAVE(id), data),
  approveLeave: (id, leaveId) => apiPost(API_ENDPOINTS.STAFF.APPROVE_LEAVE(id, leaveId)),
  updatePayroll: (id, data) => apiPatch(API_ENDPOINTS.STAFF.PAYROLL(id), data),
  uploadDocument: (id, formData) => apiPostForm(API_ENDPOINTS.STAFF.UPLOAD_DOCUMENT(id), formData),
  auditLogs: (id, params) => apiGet(API_ENDPOINTS.STAFF.AUDIT_LOGS(id), params),
}

export const parentService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.PARENTS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.PARENTS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.PARENTS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.PARENTS.DETAIL(id)),
  export: (params) => apiGetBlob(API_ENDPOINTS.PARENTS.EXPORT, params),
  sendCredentials: (id, data) => apiPost(API_ENDPOINTS.PARENTS.SEND_CREDENTIALS(id), data),
  resetPassword: (id, data) => apiPost(API_ENDPOINTS.PARENTS.RESET_PASSWORD(id), data),
  linkStudent: (id, data) => apiPost(API_ENDPOINTS.PARENTS.LINK_STUDENT(id), data),
  unlinkStudent: (id, data) => apiPost(API_ENDPOINTS.PARENTS.UNLINK_STUDENT(id), data),
  updateCommunication: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.COMMUNICATION(id), data),
  updateEmergencyContact: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.EMERGENCY_CONTACT(id), data),
  updateGuardian: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.GUARDIAN(id), data),
  setMobileAppAccess: (id, data) => apiPost(API_ENDPOINTS.PARENTS.MOBILE_APP_ACCESS(id), data),
}

export const communicationService = {
  templates: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.COMMUNICATIONS.TEMPLATES, params),
    get: (id) => apiGet(API_ENDPOINTS.COMMUNICATIONS.TEMPLATE_DETAIL(id)),
    create: (data) => apiPost(API_ENDPOINTS.COMMUNICATIONS.TEMPLATES, data),
    update: (id, data) => apiPatch(API_ENDPOINTS.COMMUNICATIONS.TEMPLATE_DETAIL(id), data),
    delete: (id) => apiDelete(API_ENDPOINTS.COMMUNICATIONS.TEMPLATE_DETAIL(id)),
  },
  messages: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.COMMUNICATIONS.MESSAGES, params),
    get: (id) => apiGet(API_ENDPOINTS.COMMUNICATIONS.MESSAGE_DETAIL(id)),
    create: (data) => apiPost(API_ENDPOINTS.COMMUNICATIONS.MESSAGES, data),
    update: (id, data) => apiPatch(API_ENDPOINTS.COMMUNICATIONS.MESSAGE_DETAIL(id), data),
    delete: (id) => apiDelete(API_ENDPOINTS.COMMUNICATIONS.MESSAGE_DETAIL(id)),
    previewAudience: (data) => apiPost(API_ENDPOINTS.COMMUNICATIONS.PREVIEW_AUDIENCE, data),
    send: (id) => apiPost(API_ENDPOINTS.COMMUNICATIONS.SEND(id)),
    schedule: (id, data) => apiPost(API_ENDPOINTS.COMMUNICATIONS.SCHEDULE(id), data),
    cancel: (id) => apiPost(API_ENDPOINTS.COMMUNICATIONS.CANCEL(id)),
    deliveryReport: (id) => apiGet(API_ENDPOINTS.COMMUNICATIONS.DELIVERY_REPORT(id)),
    readReceipts: (id) => apiGet(API_ENDPOINTS.COMMUNICATIONS.READ_RECEIPTS(id)),
    processScheduled: () => apiPost(API_ENDPOINTS.COMMUNICATIONS.PROCESS_SCHEDULED),
  },
  deliveries: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.COMMUNICATIONS.DELIVERIES, params),
    markRead: (id) => apiPost(API_ENDPOINTS.COMMUNICATIONS.MARK_READ(id)),
  },
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

export const schoolSettingsService = {
  getSections: () => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.SECTIONS),
  getAll: () => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.ALL),
  get: (section) => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.SECTION(section)),
  update: (section, data) => apiPatch(API_ENDPOINTS.SCHOOL_SETTINGS.SECTION(section), data),
  previewNumber: (data) => apiPost(API_ENDPOINTS.SCHOOL_SETTINGS.PREVIEW_NUMBER, data),
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
    bulkImport: (items) => apiPost(`${apiPath}bulk-import/`, { items }),
    bulkUpdate: (items) => apiPatch(`${apiPath}bulk-update/`, { items }),
    export: (params) => apiGetBlob(`${apiPath}export/`, params),
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

export function createSchoolMasterService(masterType) {
  const apiPath = API_ENDPOINTS.SCHOOL_MASTERS.LIST(masterType)
  const detail = (id) => API_ENDPOINTS.SCHOOL_MASTERS.DETAIL(masterType, id)
  return {
    list: (params) => apiGetPaginated(apiPath, params),
    get: (id) => apiGet(detail(id)),
    create: (data) => apiPost(apiPath, data),
    update: (id, data) => apiPatch(detail(id), data),
    delete: (id) => apiDelete(detail(id)),
    bulkImport: (items) => apiPost(API_ENDPOINTS.SCHOOL_MASTERS.BULK_IMPORT(masterType), { items }),
    export: (params) => apiGetBlob(API_ENDPOINTS.SCHOOL_MASTERS.EXPORT(masterType), params),
  }
}

export const schoolMasterService = {
  getTypes: () => apiGet(API_ENDPOINTS.SCHOOL_MASTERS.TYPES),
  forType: (masterType) => createSchoolMasterService(masterType),
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
