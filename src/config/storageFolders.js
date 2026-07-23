/**
 * Module folder keys for POST /api/v1/storage/upload/
 * Must match ERP_Backend/core/storage/constants.py
 */
export const STORAGE_FOLDERS = {
  USER_PROFILE: 'user_profile',
  STUDENT_PROFILE: 'student_profile',
  STUDENT_SIGNATURE: 'student_signature',
  STUDENT_DOCUMENT: 'student_document',
  STUDENT_CERTIFICATE: 'student_certificate',
  PARENT_PROFILE: 'parent_profile',
  PARENT_DOCUMENT: 'parent_document',
  PARENT_PICKUP: 'parent_pickup',
  ADMISSIONS: 'admissions',
  ANNOUNCEMENTS: 'announcements',
  STAFF_PROFILE: 'staff_profile',
  STAFF_DOCUMENT: 'staff_document',
  TEACHER_PROFILE: 'teacher_profile',
  TEACHER_DOCUMENT: 'teacher_document',
  SCHOOL_LOGO: 'school_logo',
  SCHOOL_BRANDING: 'school_branding',
  SCHOOL_DOCUMENT: 'school_document',
  ORGANIZATION_LOGO: 'organization_logo',
  ORGANIZATION_DOCUMENT: 'organization_document',
  LMS_CONTENT: 'lms_content',
  LMS_ASSIGNMENT: 'lms_assignment',
  LMS_SUBMISSION: 'lms_submission',
  DOCUMENTS_PDF: 'documents_pdf',
  DOCUMENTS_BULK: 'documents_bulk',
  ATTENDANCE_FACE: 'attendance_face',
}

export const STORAGE_FOLDER_LABELS = {
  [STORAGE_FOLDERS.STUDENT_PROFILE]: 'Student profile photo',
  [STORAGE_FOLDERS.PARENT_PROFILE]: 'Parent profile photo',
  [STORAGE_FOLDERS.ANNOUNCEMENTS]: 'Announcements & attachments',
  [STORAGE_FOLDERS.ADMISSIONS]: 'Admission documents',
  [STORAGE_FOLDERS.STUDENT_DOCUMENT]: 'Student documents',
}
