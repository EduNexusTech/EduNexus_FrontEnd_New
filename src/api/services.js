import { API_ENDPOINTS } from '@/config/endpoints'
import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
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
  suspend: (id) => apiPost(API_ENDPOINTS.ORGANIZATIONS.SUSPEND(id)),
  uploadDocuments: (id, formData) => apiPostForm(API_ENDPOINTS.ORGANIZATIONS.UPLOAD_DOCUMENTS(id), formData),
  deleteDocument: (id, documentId) => apiDelete(API_ENDPOINTS.ORGANIZATIONS.DELETE_DOCUMENT(id, documentId)),
  getSettings: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.SETTINGS(id)),
  updateSettings: (id, payload) => apiPatch(API_ENDPOINTS.ORGANIZATIONS.SETTINGS(id), payload),
  getBranding: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.BRANDING(id)),
  updateBranding: (id, data) => {
    const isForm = typeof FormData !== 'undefined' && data instanceof FormData
    return isForm
      ? apiPatchForm(API_ENDPOINTS.ORGANIZATIONS.BRANDING(id), data)
      : apiPatch(API_ENDPOINTS.ORGANIZATIONS.BRANDING(id), data)
  },
  getSubscription: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.SUBSCRIPTION(id)),
  assignSubscription: (id, payload) => apiPost(API_ENDPOINTS.ORGANIZATIONS.ASSIGN_SUBSCRIPTION(id), payload),
  getFeatures: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.FEATURES(id)),
  setFeature: (id, payload) => apiPost(API_ENDPOINTS.ORGANIZATIONS.FEATURES(id), payload),
  getDomains: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.DOMAINS(id)),
  addDomain: (id, payload) => apiPost(API_ENDPOINTS.ORGANIZATIONS.DOMAINS(id), payload),
  getUsage: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.USAGE(id)),
  getBackups: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.BACKUPS(id)),
  requestBackup: (id) => apiPost(API_ENDPOINTS.ORGANIZATIONS.BACKUPS(id)),
  getSaasOverview: (id) => apiGet(API_ENDPOINTS.ORGANIZATIONS.SAAS_OVERVIEW(id)),
  clone: (id, payload) => apiPost(API_ENDPOINTS.ORGANIZATIONS.CLONE(id), payload),
  analytics: () => apiGet(API_ENDPOINTS.ORGANIZATIONS.ANALYTICS),
}

export const subscriptionPlanService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.SUBSCRIPTION_PLANS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.SUBSCRIPTION_PLANS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.SUBSCRIPTION_PLANS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.SUBSCRIPTION_PLANS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.SUBSCRIPTION_PLANS.DETAIL(id)),
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
  activate: (id) => apiPost(API_ENDPOINTS.SCHOOLS.ACTIVATE(id)),
  deactivate: (id) => apiPost(API_ENDPOINTS.SCHOOLS.DEACTIVATE(id)),
  suspend: (id) => apiPost(API_ENDPOINTS.SCHOOLS.SUSPEND(id)),
  getBranding: (id) => apiGet(API_ENDPOINTS.SCHOOLS.BRANDING(id)),
  updateBranding: (id, data) => {
    const isForm = typeof FormData !== 'undefined' && data instanceof FormData
    return isForm
      ? apiPatchForm(API_ENDPOINTS.SCHOOLS.BRANDING(id), data)
      : apiPatch(API_ENDPOINTS.SCHOOLS.BRANDING(id), data)
  },
  getFeatures: (id) => apiGet(API_ENDPOINTS.SCHOOLS.FEATURES(id)),
  setFeature: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.FEATURES(id), payload),
  getAcademicConfig: (id) => apiGet(API_ENDPOINTS.SCHOOLS.ACADEMIC_CONFIG(id)),
  updateAcademicConfig: (id, payload) => apiPatch(API_ENDPOINTS.SCHOOLS.ACADEMIC_CONFIG(id), payload),
  getAnalytics: (id) => apiGet(API_ENDPOINTS.SCHOOLS.ANALYTICS(id)),
  getSaasOverview: (id) => apiGet(API_ENDPOINTS.SCHOOLS.SAAS_OVERVIEW(id)),
  clone: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.CLONE(id), payload),
  export: (params) => apiGetBlob(API_ENDPOINTS.SCHOOLS.EXPORT, params),
  import: (payload) => apiPost(API_ENDPOINTS.SCHOOLS.IMPORT, payload),
  listInfrastructure: (id, params) => apiGet(API_ENDPOINTS.SCHOOLS.INFRASTRUCTURE(id), params),
  createInfrastructure: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.INFRASTRUCTURE(id), payload),
  updateInfrastructure: (id, infraId, payload) => apiPatch(API_ENDPOINTS.SCHOOLS.INFRASTRUCTURE_DETAIL(id, infraId), payload),
  deleteInfrastructure: (id, infraId) => apiDelete(API_ENDPOINTS.SCHOOLS.INFRASTRUCTURE_DETAIL(id, infraId)),
  getCalendar: (id, params) => apiGet(API_ENDPOINTS.SCHOOLS.CALENDAR(id), params),
  saveCalendarDay: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.CALENDAR(id), payload),
  getTimings: (id) => apiGet(API_ENDPOINTS.SCHOOLS.TIMINGS(id)),
  updateTimings: (id, payload) => apiPut(API_ENDPOINTS.SCHOOLS.TIMINGS(id), payload),
  getIntegrations: (id) => apiGet(API_ENDPOINTS.SCHOOLS.INTEGRATIONS(id)),
  saveIntegration: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.INTEGRATIONS(id), payload),
  getStaffAssignments: (id) => apiGet(API_ENDPOINTS.SCHOOLS.STAFF_ASSIGNMENTS(id)),
  saveStaffAssignment: (id, payload) => apiPost(API_ENDPOINTS.SCHOOLS.STAFF_ASSIGNMENTS(id), payload),
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
    prepareConversion: (id) => apiPost(API_ENDPOINTS.ADMISSIONS.PREPARE_CONVERSION(id)),
    workflow: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.WORKFLOW(id)),
    lockSeat: (id, data, action = 'lock') =>
      apiPost(`${API_ENDPOINTS.ADMISSIONS.SEATS(id)}?action=${action}`, data),
    receipt: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.RECEIPT(id)),
    followUps: (id) => apiGet(API_ENDPOINTS.ADMISSIONS.FOLLOW_UPS(id)),
    addFollowUp: (id, data) => apiPost(API_ENDPOINTS.ADMISSIONS.FOLLOW_UPS(id), data),
  },
  analyticsFunnel: (params) => apiGet(API_ENDPOINTS.ADMISSIONS.ANALYTICS_FUNNEL, params),
  bulkAction: (payload) => apiPost(API_ENDPOINTS.ADMISSIONS.BULK_ACTION, payload),
  portalStatus: (token) => apiGet(API_ENDPOINTS.ADMISSIONS.PORTAL(token)),
}

export const studentService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.STUDENTS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.STUDENTS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.STUDENTS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.STUDENTS.DETAIL(id)),
  bulkImport: (items) => apiPost(API_ENDPOINTS.STUDENTS.BULK_IMPORT, { items }),
  bulkPromote: (data) => apiPost(API_ENDPOINTS.STUDENTS.BULK_PROMOTE, data),
  export: (params) => apiGetBlob(API_ENDPOINTS.STUDENTS.EXPORT, params),
  dashboard: (params) => apiGet(API_ENDPOINTS.STUDENTS.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.STUDENTS.SEARCH, params),
  getSisSettings: (params) => apiGet(API_ENDPOINTS.STUDENTS.SIS_SETTINGS, params),
  updateSisSettings: (data, params) => apiPatch(API_ENDPOINTS.STUDENTS.SIS_SETTINGS, data, { params }),
  regenerateQr: (id) => apiPost(API_ENDPOINTS.STUDENTS.REGENERATE_QR(id)),
  idCard: (id) => apiGet(API_ENDPOINTS.STUDENTS.ID_CARD(id)),
  updateStatus: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.UPDATE_STATUS(id), data),
  updateTransport: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.TRANSPORT(id), data),
  updateHostel: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.HOSTEL(id), data),
  updateMedical: (id, data) => apiPatch(API_ENDPOINTS.STUDENTS.MEDICAL(id), data),
  uploadDocument: (id, formData) => apiPostForm(API_ENDPOINTS.STUDENTS.UPLOAD_DOCUMENT(id), formData),
  verifyDocument: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.VERIFY_DOCUMENT(id), data),
  addAchievement: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.ACHIEVEMENTS(id), data),
  addDiscipline: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.DISCIPLINE(id), data),
  addSibling: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.SIBLINGS(id), data),
  promote: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.PROMOTE(id), data),
  transfer: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.TRANSFER(id), data),
  graduate: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.GRADUATE(id), data),
  alumni: (id, data) => apiPost(API_ENDPOINTS.STUDENTS.ALUMNI(id), data),
  generateRfid: (id) => apiPost(API_ENDPOINTS.STUDENTS.GENERATE_RFID(id)),
}

export const teacherService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.TEACHERS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.TEACHERS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.TEACHERS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.TEACHERS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.TEACHERS.DETAIL(id)),
  export: (params) => apiGetBlob(API_ENDPOINTS.TEACHERS.EXPORT, params),
  dashboard: (params) => apiGet(API_ENDPOINTS.TEACHERS.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.TEACHERS.SEARCH, params),
  getTeacherSettings: (params) => apiGet(API_ENDPOINTS.TEACHERS.TEACHER_SETTINGS, params),
  updateTeacherSettings: (data, params) => apiPatch(API_ENDPOINTS.TEACHERS.TEACHER_SETTINGS, data, { params }),
  sendCredentials: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.SEND_CREDENTIALS(id), data),
  addQualification: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.QUALIFICATIONS(id), data),
  addExperience: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.EXPERIENCE(id), data),
  assignSubject: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.ASSIGN_SUBJECT(id), data),
  academicAssign: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.ACADEMIC_ASSIGNMENTS(id), data),
  workload: (id, params) => apiGet(API_ENDPOINTS.TEACHERS.WORKLOAD(id), params),
  recalculateWorkload: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.WORKLOAD(id), data),
  setAvailability: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.AVAILABILITY(id), data),
  addProfessionalCert: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.PROFESSIONAL_CERTS(id), data),
  getPerformanceFoundation: (id, params) => apiGet(API_ENDPOINTS.TEACHERS.PERFORMANCE_FOUNDATION(id), params),
  updatePerformanceFoundation: (id, data) => apiPatch(API_ENDPOINTS.TEACHERS.PERFORMANCE_FOUNDATION(id), data),
  deactivate: (id, data) => apiPost(API_ENDPOINTS.TEACHERS.DEACTIVATE(id), data),
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
  dashboard: (params) => apiGet(API_ENDPOINTS.STAFF.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.STAFF.SEARCH, params),
  orgChart: (params) => apiGet(API_ENDPOINTS.STAFF.ORG_CHART, params),
  getHrSettings: (params) => apiGet(API_ENDPOINTS.STAFF.HR_SETTINGS, params),
  updateHrSettings: (data, params) => apiPatch(API_ENDPOINTS.STAFF.HR_SETTINGS, data, { params }),
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
  startOnboarding: (id) => apiPost(API_ENDPOINTS.STAFF.ONBOARDING_START(id)),
  completeOnboardingStep: (id, data) => apiPost(API_ENDPOINTS.STAFF.ONBOARDING_STEP(id), data),
  transfer: (id, data) => apiPost(API_ENDPOINTS.STAFF.TRANSFER(id), data),
  promote: (id, data) => apiPost(API_ENDPOINTS.STAFF.PROMOTE(id), data),
  exit: (id, data) => apiPost(API_ENDPOINTS.STAFF.EXIT(id), data),
  assignAsset: (id, data) => apiPost(API_ENDPOINTS.STAFF.ASSETS(id), data),
  confirm: (id, data) => apiPost(API_ENDPOINTS.STAFF.CONFIRM(id), data),
  transitionStatus: (id, data) => apiPost(API_ENDPOINTS.STAFF.TRANSITION_STATUS(id), data),
}

// HRMS alias — same Employee SoT as staffService
export const employeeService = staffService

export const attendanceService = {
  list: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.ATTENDANCE.DETAIL(id)),
  dashboard: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.SEARCH, params),
  getSettings: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.SETTINGS, params),
  updateSettings: (data, params) => apiPatch(API_ENDPOINTS.ATTENDANCE.SETTINGS, data, { params }),
  calendarDay: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.CALENDAR_DAY, params),
  mark: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.MARK, data),
  bulkMark: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.BULK_MARK, data),
  correct: (id, data) => apiPost(API_ENDPOINTS.ATTENDANCE.CORRECT(id), data),
  approve: (id) => apiPost(API_ENDPOINTS.ATTENDANCE.APPROVE(id)),
  employeePunch: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.EMPLOYEE_PUNCH, data),
  reportDaily: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.REPORT_DAILY, params),
  reportPercentage: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.REPORT_PERCENTAGE, params),
  defaulters: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.DEFAULTERS, params),
  policies: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.POLICIES, params),
  savePolicy: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.POLICIES, data),
  importCsv: (formData) => apiPostForm(API_ENDPOINTS.ATTENDANCE.IMPORT, formData),
  export: (params) => apiGetBlob(API_ENDPOINTS.ATTENDANCE.EXPORT, params),
  biometricDevices: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.BIOMETRIC_DEVICES, params),
  registerDevice: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.BIOMETRIC_DEVICES, data),
  biometricIngest: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.BIOMETRIC_INGEST, data),
  leaveLink: (data) => apiPost(API_ENDPOINTS.ATTENDANCE.LEAVE_LINK, data),
  sessions: (params) => apiGet(API_ENDPOINTS.ATTENDANCE.SESSIONS, params),
}

export const timetableService = {
  list: (params) => apiGet(API_ENDPOINTS.TIMETABLE.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.TIMETABLE.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.TIMETABLE.LIST, data),
  dashboard: (params) => apiGet(API_ENDPOINTS.TIMETABLE.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.TIMETABLE.SEARCH, params),
  getSettings: (params) => apiGet(API_ENDPOINTS.TIMETABLE.SETTINGS, params),
  updateSettings: (data, params) => apiPatch(API_ENDPOINTS.TIMETABLE.SETTINGS, data, { params }),
  versions: (id, params) => apiGet(API_ENDPOINTS.TIMETABLE.VERSIONS(id), params),
  publish: (versionId, data = {}) => apiPost(API_ENDPOINTS.TIMETABLE.PUBLISH(versionId), data),
  clone: (versionId, data = {}) => apiPost(API_ENDPOINTS.TIMETABLE.CLONE(versionId), data),
  rollback: (versionId, data = {}) => apiPost(API_ENDPOINTS.TIMETABLE.ROLLBACK(versionId), data),
  slots: (versionId, params) => apiGet(API_ENDPOINTS.TIMETABLE.SLOTS(versionId), params),
  createSlot: (versionId, data) => apiPost(API_ENDPOINTS.TIMETABLE.SLOTS(versionId), data),
  bulkSlots: (versionId, data) => apiPost(API_ENDPOINTS.TIMETABLE.SLOTS_BULK(versionId), data),
  teacherSchedule: (params) => apiGet(API_ENDPOINTS.TIMETABLE.TEACHER_SCHEDULE, params),
  studentSchedule: (params) => apiGet(API_ENDPOINTS.TIMETABLE.STUDENT_SCHEDULE, params),
  roomSchedule: (params) => apiGet(API_ENDPOINTS.TIMETABLE.ROOM_SCHEDULE, params),
  conflicts: (versionId, params) => apiGet(API_ENDPOINTS.TIMETABLE.CONFLICTS(versionId), params),
  detectConflicts: (versionId, data = {}) => apiPost(API_ENDPOINTS.TIMETABLE.CONFLICTS(versionId), data),
  resolveConflict: (id, data) => apiPost(API_ENDPOINTS.TIMETABLE.RESOLVE_CONFLICT(id), data),
  substitutions: (params) => apiGet(API_ENDPOINTS.TIMETABLE.SUBSTITUTIONS, params),
  createSubstitution: (data) => apiPost(API_ENDPOINTS.TIMETABLE.SUBSTITUTIONS, data),
  approveSubstitution: (id, data = {}) => apiPost(API_ENDPOINTS.TIMETABLE.APPROVE_SUBSTITUTION(id), data),
  suggestSubstitutes: (params) => apiGet(API_ENDPOINTS.TIMETABLE.SUGGEST_SUBSTITUTES, params),
  resources: (params) => apiGet(API_ENDPOINTS.TIMETABLE.RESOURCES, params),
  createResource: (data) => apiPost(API_ENDPOINTS.TIMETABLE.RESOURCES, data),
  bookResource: (data) => apiPost(API_ENDPOINTS.TIMETABLE.RESOURCE_BOOKINGS, data),
  facilityRooms: (params) => apiGet(API_ENDPOINTS.TIMETABLE.FACILITY_ROOMS, params),
  createFacilityRoom: (data) => apiPost(API_ENDPOINTS.TIMETABLE.FACILITY_ROOMS, data),
  events: (params) => apiGet(API_ENDPOINTS.TIMETABLE.EVENTS, params),
  createEvent: (data) => apiPost(API_ENDPOINTS.TIMETABLE.EVENTS, data),
  meetings: (params) => apiGet(API_ENDPOINTS.TIMETABLE.MEETINGS, params),
  createMeeting: (data) => apiPost(API_ENDPOINTS.TIMETABLE.MEETINGS, data),
  roomUtilization: (versionId, params) => apiGet(API_ENDPOINTS.TIMETABLE.ROOM_UTILIZATION(versionId), params),
  export: (versionId, params) => apiGetBlob(API_ENDPOINTS.TIMETABLE.EXPORT(versionId), params),
  importCsv: (versionId, formData) => apiPostForm(API_ENDPOINTS.TIMETABLE.IMPORT(versionId), formData),
  enqueueAiJob: (versionId, data) => apiPost(API_ENDPOINTS.TIMETABLE.AI_JOBS(versionId), data),
  templates: (params) => apiGet(API_ENDPOINTS.TIMETABLE.TEMPLATES, params),
  createTemplate: (data) => apiPost(API_ENDPOINTS.TIMETABLE.TEMPLATES, data),
}

export const feesService = {
  dashboard: (params) => apiGet(API_ENDPOINTS.FEES.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.FEES.SEARCH, params),
  getSettings: (params) => apiGet(API_ENDPOINTS.FEES.SETTINGS, params),
  updateSettings: (data, params) => apiPatch(API_ENDPOINTS.FEES.SETTINGS, data, { params }),
  heads: (params) => apiGet(API_ENDPOINTS.FEES.HEADS, params),
  createHead: (data) => apiPost(API_ENDPOINTS.FEES.HEADS, data),
  templates: (params) => apiGet(API_ENDPOINTS.FEES.TEMPLATES, params),
  createTemplate: (data) => apiPost(API_ENDPOINTS.FEES.TEMPLATES, data),
  assignments: (params) => apiGet(API_ENDPOINTS.FEES.ASSIGNMENTS, params),
  assign: (data) => apiPost(API_ENDPOINTS.FEES.ASSIGNMENTS, data),
  studentProfile: (params) => apiGet(API_ENDPOINTS.FEES.STUDENT_PROFILE, params),
  invoices: (params) => apiGet(API_ENDPOINTS.FEES.INVOICES, params),
  invoiceDetail: (id, params) => apiGet(API_ENDPOINTS.FEES.INVOICE_DETAIL(id), params),
  generateInvoice: (data) => apiPost(API_ENDPOINTS.FEES.GENERATE_INVOICE, data),
  payments: (params) => apiGet(API_ENDPOINTS.FEES.PAYMENTS, params),
  recordPayment: (data) => apiPost(API_ENDPOINTS.FEES.RECORD_PAYMENT, data),
  receipts: (params) => apiGet(API_ENDPOINTS.FEES.RECEIPTS, params),
  gatewayIntent: (data) => apiPost(API_ENDPOINTS.FEES.GATEWAY_INTENT, data),
  concessionRules: (params) => apiGet(API_ENDPOINTS.FEES.CONCESSION_RULES, params),
  applyConcession: (data) => apiPost(API_ENDPOINTS.FEES.APPLY_CONCESSION, data),
  approveConcession: (id, data) => apiPost(API_ENDPOINTS.FEES.APPROVE_CONCESSION(id), data),
  scholarshipPrograms: (params) => apiGet(API_ENDPOINTS.FEES.SCHOLARSHIP_PROGRAMS, params),
  scholarshipAwards: (params) => apiGet(API_ENDPOINTS.FEES.SCHOLARSHIP_AWARDS, params),
  approveScholarship: (id, data) => apiPost(API_ENDPOINTS.FEES.APPROVE_SCHOLARSHIP(id), data),
  refunds: (params) => apiGet(API_ENDPOINTS.FEES.REFUNDS, params),
  approveRefund: (id, data) => apiPost(API_ENDPOINTS.FEES.APPROVE_REFUND(id), data),
  integrationCharge: (data) => apiPost(API_ENDPOINTS.FEES.INTEGRATION_CHARGE, data),
  defaulters: (params) => apiGet(API_ENDPOINTS.FEES.DEFAULTERS, params),
  paymentMethods: (params) => apiGet(API_ENDPOINTS.FEES.PAYMENT_METHODS, params),
  exportCollections: (params) => apiGetBlob(API_ENDPOINTS.FEES.EXPORT_COLLECTIONS, params),
  importPayments: (formData) => apiPostForm(API_ENDPOINTS.FEES.IMPORT_PAYMENTS, formData),
  lateFeeRules: (params) => apiGet(API_ENDPOINTS.FEES.LATE_FEE_RULES, params),
  runLateFees: (data) => apiPost(API_ENDPOINTS.FEES.RUN_LATE_FEES, data),
}

export const parentService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.PARENTS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.PARENTS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.PARENTS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.PARENTS.DETAIL(id)),
  export: (params) => apiGetBlob(API_ENDPOINTS.PARENTS.EXPORT, params),
  dashboard: (params) => apiGet(API_ENDPOINTS.PARENTS.DASHBOARD, params),
  search: (params) => apiGet(API_ENDPOINTS.PARENTS.SEARCH, params),
  getGuardianSettings: (params) => apiGet(API_ENDPOINTS.PARENTS.GUARDIAN_SETTINGS, params),
  updateGuardianSettings: (data, params) => apiPatch(API_ENDPOINTS.PARENTS.GUARDIAN_SETTINGS, data, { params }),
  portal: (id) => apiGet(API_ENDPOINTS.PARENTS.PORTAL(id)),
  invitePortal: (id) => apiPost(API_ENDPOINTS.PARENTS.INVITE_PORTAL(id)),
  sendCredentials: (id, data) => apiPost(API_ENDPOINTS.PARENTS.SEND_CREDENTIALS(id), data),
  resetPassword: (id, data) => apiPost(API_ENDPOINTS.PARENTS.RESET_PASSWORD(id), data),
  linkStudent: (id, data) => apiPost(API_ENDPOINTS.PARENTS.LINK_STUDENT(id), data),
  unlinkStudent: (id, data) => apiPost(API_ENDPOINTS.PARENTS.UNLINK_STUDENT(id), data),
  updateCommunication: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.COMMUNICATION(id), data),
  updateEmergencyContact: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.EMERGENCY_CONTACT(id), data),
  updateGuardian: (id, data) => apiPatch(API_ENDPOINTS.PARENTS.GUARDIAN(id), data),
  setMobileAppAccess: (id, data) => apiPost(API_ENDPOINTS.PARENTS.MOBILE_APP_ACCESS(id), data),
}

export const householdService = {
  list: (params) => apiGet(API_ENDPOINTS.HOUSEHOLDS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.HOUSEHOLDS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.HOUSEHOLDS.LIST, data),
  addMember: (id, data) => apiPost(API_ENDPOINTS.HOUSEHOLDS.ADD_MEMBER(id), data),
  addEmergencyContact: (id, data) => apiPost(API_ENDPOINTS.HOUSEHOLDS.EMERGENCY_CONTACTS(id), data),
}

export const pickupService = {
  list: (params) => apiGet(API_ENDPOINTS.PICKUPS.LIST, params),
  authorize: (data) => apiPost(API_ENDPOINTS.PICKUPS.LIST, data),
  verify: (data) => apiPost(API_ENDPOINTS.PICKUPS.VERIFY, data),
  history: (params) => apiGet(API_ENDPOINTS.PICKUPS.HISTORY, params),
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
  getEffectiveAll: (params) => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.EFFECTIVE_ALL, params),
  get: (section) => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.SECTION(section)),
  getEffective: (section, params) => apiGet(API_ENDPOINTS.SCHOOL_SETTINGS.EFFECTIVE_SECTION(section), params),
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

export const academicYearService = {
  list: (params) => apiGetPaginated(API_ENDPOINTS.ACADEMIC_YEARS.LIST, params),
  get: (id) => apiGet(API_ENDPOINTS.ACADEMIC_YEARS.DETAIL(id)),
  create: (data) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.LIST, data),
  update: (id, data) => apiPatch(API_ENDPOINTS.ACADEMIC_YEARS.DETAIL(id), data),
  delete: (id) => apiDelete(API_ENDPOINTS.ACADEMIC_YEARS.DETAIL(id)),
  setCurrent: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.SET_CURRENT(id)),
  freeze: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.FREEZE(id)),
  unfreeze: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.UNFREEZE(id)),
  lock: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.LOCK(id)),
  unlock: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.UNLOCK(id)),
  close: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.CLOSE(id)),
  archive: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.ARCHIVE(id)),
  clone: (id, payload) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.CLONE(id), payload),
  generateCalendar: (id) => apiPost(API_ENDPOINTS.ACADEMIC_YEARS.GENERATE_CALENDAR(id)),
  getSettings: (id, params) => apiGet(API_ENDPOINTS.ACADEMIC_YEARS.SETTINGS(id), params),
  updateSettings: (id, payload) => apiPatch(API_ENDPOINTS.ACADEMIC_YEARS.SETTINGS(id), payload),
  clearSettingsSection: (id, section) =>
    apiDelete(`${API_ENDPOINTS.ACADEMIC_YEARS.SETTINGS(id)}?section=${encodeURIComponent(section)}`),
}

export const academicServices = {
  academicYears: academicYearService,
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
  gradingSchemes: createAcademicService(API_ENDPOINTS.ACADEMICS.GRADING_SCHEMES),
  gradeBands: createAcademicService(API_ENDPOINTS.ACADEMICS.GRADE_BANDS),
  assessmentCategories: createAcademicService(API_ENDPOINTS.ACADEMICS.ASSESSMENT_CATEGORIES),
  examTypes: createAcademicService(API_ENDPOINTS.ACADEMICS.EXAM_TYPES),
  assessmentTemplates: createAcademicService(API_ENDPOINTS.ACADEMICS.ASSESSMENT_TEMPLATES),
  policies: createAcademicService(API_ENDPOINTS.ACADEMICS.POLICIES),
  rooms: createAcademicService(API_ENDPOINTS.ACADEMICS.ROOMS),
  teacherAvailability: createAcademicService(API_ENDPOINTS.ACADEMICS.TEACHER_AVAILABILITY),
  classSectionSubjects: createAcademicService(API_ENDPOINTS.ACADEMICS.CLASS_SECTION_SUBJECTS),
  subjectTree: (params) => apiGet(API_ENDPOINTS.ACADEMICS.SUBJECT_TREE, params),
}

export const mdmService = {
  getContract: () => apiGet(API_ENDPOINTS.MDM.CONTRACT),
  catalogSummary: () => apiGet(API_ENDPOINTS.MDM.CATALOG),
  listBoards: (params) => apiGet(API_ENDPOINTS.MDM.BOARDS, params),
  listSubjects: (params) => apiGet(API_ENDPOINTS.MDM.SUBJECTS, params),
  listCurriculums: (params) => apiGet(API_ENDPOINTS.MDM.CURRICULUMS, params),
  listGradingSchemes: (params) => apiGet(API_ENDPOINTS.MDM.GRADING_SCHEMES, params),
  listCalendars: (params) => apiGet(API_ENDPOINTS.MDM.CALENDARS, params),
  adoptBoard: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_BOARD, payload),
  adoptSubject: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_SUBJECT, payload),
  adoptGrading: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_GRADING, payload),
  adoptCalendar: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_CALENDAR, payload),
  adoptCurriculum: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_CURRICULUM, payload),
  adoptPack: (payload) => apiPost(API_ENDPOINTS.MDM.ADOPT_PACK, payload),
  resolveOrg: (params) => apiGet(API_ENDPOINTS.MDM.RESOLVE_ORG, params),
  resolveSchoolYear: (params) => apiGet(API_ENDPOINTS.MDM.RESOLVE_SCHOOL_YEAR, params),
  listAdoptions: (params) => apiGet(API_ENDPOINTS.MDM.ADOPTIONS, params),
}

// Attach enterprise admission catalogs after createAcademicService is defined
Object.assign(admissionService, {
  cycles: createAcademicService(API_ENDPOINTS.ADMISSIONS.CYCLES),
  categories: createAcademicService(API_ENDPOINTS.ADMISSIONS.CATEGORIES),
  seatMatrices: createAcademicService(API_ENDPOINTS.ADMISSIONS.SEAT_MATRICES),
  seatAllocations: {
    list: (params) => apiGetPaginated(API_ENDPOINTS.ADMISSIONS.SEAT_ALLOCATIONS, params),
    allocate: (id) => apiPost(`${API_ENDPOINTS.ADMISSIONS.SEAT_ALLOCATIONS}${id}/allocate/`),
    release: (id) => apiPost(`${API_ENDPOINTS.ADMISSIONS.SEAT_ALLOCATIONS}${id}/release/`),
  },
  workflowConfigs: createAcademicService(API_ENDPOINTS.ADMISSIONS.WORKFLOW_CONFIGS),
  scholarshipTypes: createAcademicService(API_ENDPOINTS.ADMISSIONS.SCHOLARSHIP_TYPES),
  feeIntents: createAcademicService(API_ENDPOINTS.ADMISSIONS.FEE_INTENTS),
  numberSequences: createAcademicService(API_ENDPOINTS.ADMISSIONS.NUMBER_SEQUENCES),
})
