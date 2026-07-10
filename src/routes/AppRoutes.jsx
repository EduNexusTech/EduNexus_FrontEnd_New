import { Routes, Route } from 'react-router-dom'
import ProtectedRoute, { PublicRoute } from './ProtectedRoute'
import HomeRedirect from './HomeRedirect'
import DashboardLayout from '@/layouts/DashboardLayout'
import NotFoundPage from '@/pages/NotFoundPage'

import LoginPage from '@/pages/auth/LoginPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ChangePasswordPage from '@/pages/auth/ChangePasswordPage'
import ProfilePage from '@/pages/auth/ProfilePage'
import DashboardPage from '@/pages/dashboard/DashboardPage'

import OrganizationList from '@/pages/organizations/OrganizationList'
import OrganizationForm from '@/pages/organizations/OrganizationForm'
import OrganizationDetail from '@/pages/organizations/OrganizationDetail'

import SchoolList from '@/pages/schools/SchoolList'
import SchoolForm from '@/pages/schools/SchoolForm'
import SchoolDetail from '@/pages/schools/SchoolDetail'
import SchoolProfilePage from '@/pages/schools/SchoolProfilePage'

import SchoolUserList from '@/pages/school-users/SchoolUserList'
import SchoolUserForm from '@/pages/school-users/SchoolUserForm'
import SchoolUserDetail from '@/pages/school-users/SchoolUserDetail'

import StudentList from '@/pages/students/StudentList'
import StudentForm from '@/pages/students/StudentForm'
import StudentDetail from '@/pages/students/StudentDetail'
import TeacherList from '@/pages/teachers/TeacherList'
import TeacherForm from '@/pages/teachers/TeacherForm'
import TeacherDetail from '@/pages/teachers/TeacherDetail'
import ParentList from '@/pages/parents/ParentList'
import ParentForm from '@/pages/parents/ParentForm'
import ParentDetail from '@/pages/parents/ParentDetail'
import StaffList from '@/pages/staff/StaffList'
import StaffForm from '@/pages/staff/StaffForm'
import StaffDetail from '@/pages/staff/StaffDetail'
import CommunicationsHubPage from '@/pages/communications/CommunicationsHubPage'
import CommunicationTemplateList from '@/pages/communications/CommunicationTemplateList'
import CommunicationTemplateForm from '@/pages/communications/CommunicationTemplateForm'
import CommunicationMessageList from '@/pages/communications/CommunicationMessageList'
import CommunicationMessageForm from '@/pages/communications/CommunicationMessageForm'
import CommunicationMessageDetail from '@/pages/communications/CommunicationMessageDetail'

import AdmissionsHubPage from '@/pages/admissions/AdmissionsHubPage'
import AdmissionLeadList from '@/pages/admissions/AdmissionLeadList'
import AdmissionLeadForm from '@/pages/admissions/AdmissionLeadForm'
import AdmissionApplicationList from '@/pages/admissions/AdmissionApplicationList'
import AdmissionApplicationForm from '@/pages/admissions/AdmissionApplicationForm'
import AdmissionApplicationDetail from '@/pages/admissions/AdmissionApplicationDetail'

import UserList from '@/pages/users/UserList'
import UserForm from '@/pages/users/UserForm'
import UserDetail from '@/pages/users/UserDetail'

import RoleList from '@/pages/roles/RoleList'
import RoleForm from '@/pages/roles/RoleForm'
import RolePermissions from '@/pages/roles/RolePermissions'

import PermissionList from '@/pages/permissions/PermissionList'
import PermissionForm from '@/pages/permissions/PermissionForm'
import PermissionMatrix from '@/pages/permissions/PermissionMatrix'

import MenuList from '@/pages/menus/MenuList'
import MenuForm from '@/pages/menus/MenuForm'
import ModuleList from '@/pages/modules/ModuleList'
import ModuleForm from '@/pages/modules/ModuleForm'

import MembershipList from '@/pages/memberships/MembershipList'
import MembershipForm from '@/pages/memberships/MembershipForm'
import UserRoleList from '@/pages/user-roles/UserRoleList'
import UserRoleForm from '@/pages/user-roles/UserRoleForm'

import MastersHubPage from '@/pages/masters/MastersHubPage'
import MasterList from '@/pages/masters/MasterList'
import MasterForm from '@/pages/masters/MasterForm'
import SchoolMastersHubPage from '@/pages/school-masters/SchoolMastersHubPage'
import SchoolMasterList from '@/pages/school-masters/SchoolMasterList'
import SchoolMasterForm from '@/pages/school-masters/SchoolMasterForm'

import AcademicsHubPage from '@/pages/academics/AcademicsHubPage'
import { AcademicList, AcademicForm } from '@/pages/academics/AcademicList'

import AuditLogList from '@/pages/audit-logs/AuditLogList'
import AuditLogDetail from '@/pages/audit-logs/AuditLogDetail'

import SettingsPage from '@/pages/settings/SettingsPage'
import SchoolSettingsPage from '@/pages/school-settings/SchoolSettingsPage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import EduNexusPostPage from '@/pages/edu-nexus-post/EduNexusPostPage'
import AiHubPage from '@/pages/ai-hub/AiHubPage'
import AiAssistantPage from '@/pages/ai-hub/AiAssistantPage'
import AutomationsPage from '@/pages/ai-hub/AutomationsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/edu-nexus-post" element={<EduNexusPostPage />} />
          <Route path="/ai-hub" element={<AiHubPage />} />
          <Route path="/ai-hub/assistant" element={<AiAssistantPage />} />
          <Route path="/ai-hub/automations" element={<AutomationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route path="/organizations" element={<OrganizationList />} />
          <Route path="/organizations/new" element={<OrganizationForm />} />
          <Route path="/organizations/:id" element={<OrganizationDetail />} />
          <Route path="/organizations/:id/edit" element={<OrganizationForm />} />

          <Route path="/schools" element={<SchoolList />} />
          <Route path="/schools/new" element={<SchoolForm />} />
          <Route path="/schools/:id" element={<SchoolDetail />} />
          <Route path="/schools/:id/edit" element={<SchoolForm />} />
          <Route path="/schools/:id/profile" element={<SchoolProfilePage />} />
          <Route path="/school-profile" element={<SchoolProfilePage />} />

          <Route path="/school-settings" element={<SchoolSettingsPage />} />
          <Route path="/school-settings/:section" element={<SchoolSettingsPage />} />

          <Route path="/students" element={<StudentList />} />
          <Route path="/students/new" element={<StudentForm />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/students/:id/edit" element={<StudentForm />} />

          <Route path="/teachers" element={<TeacherList />} />
          <Route path="/teachers/new" element={<TeacherForm />} />
          <Route path="/teachers/:id" element={<TeacherDetail />} />
          <Route path="/teachers/:id/edit" element={<TeacherForm />} />

          <Route path="/parents" element={<ParentList />} />
          <Route path="/parents/new" element={<ParentForm />} />
          <Route path="/parents/:id" element={<ParentDetail />} />
          <Route path="/parents/:id/edit" element={<ParentForm />} />

          <Route path="/staff" element={<StaffList />} />
          <Route path="/staff/new" element={<StaffForm />} />
          <Route path="/staff/:id" element={<StaffDetail />} />
          <Route path="/staff/:id/edit" element={<StaffForm />} />

          <Route path="/communications" element={<CommunicationsHubPage />} />
          <Route path="/communications/templates" element={<CommunicationTemplateList />} />
          <Route path="/communications/templates/new" element={<CommunicationTemplateForm />} />
          <Route path="/communications/templates/:id/edit" element={<CommunicationTemplateForm />} />
          <Route path="/communications/messages" element={<CommunicationMessageList />} />
          <Route path="/communications/messages/new" element={<CommunicationMessageForm />} />
          <Route path="/communications/messages/:id" element={<CommunicationMessageDetail />} />
          <Route path="/communications/messages/:id/edit" element={<CommunicationMessageForm />} />

          <Route path="/admissions" element={<AdmissionsHubPage />} />
          <Route path="/admissions/leads" element={<AdmissionLeadList />} />
          <Route path="/admissions/leads/new" element={<AdmissionLeadForm />} />
          <Route path="/admissions/leads/:id/edit" element={<AdmissionLeadForm />} />
          <Route path="/admissions/applications" element={<AdmissionApplicationList />} />
          <Route path="/admissions/applications/new" element={<AdmissionApplicationForm />} />
          <Route path="/admissions/applications/:id" element={<AdmissionApplicationDetail />} />
          <Route path="/admissions/applications/:id/edit" element={<AdmissionApplicationForm />} />

          <Route path="/school-users" element={<SchoolUserList />} />
          <Route path="/school-users/new" element={<SchoolUserForm />} />
          <Route path="/school-users/:id" element={<SchoolUserDetail />} />
          <Route path="/school-users/:id/edit" element={<SchoolUserForm />} />

          <Route path="/users" element={<UserList />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/users/:id/edit" element={<UserForm />} />

          <Route path="/roles" element={<RoleList />} />
          <Route path="/roles/new" element={<RoleForm />} />
          <Route path="/roles/:id/edit" element={<RoleForm />} />
          <Route path="/roles/:id/permissions" element={<RolePermissions />} />

          <Route path="/permissions" element={<PermissionList />} />
          <Route path="/permissions/new" element={<PermissionForm />} />
          <Route path="/permissions/:id/edit" element={<PermissionForm />} />
          <Route path="/permissions/matrix" element={<PermissionMatrix />} />

          <Route path="/menus" element={<MenuList />} />
          <Route path="/menus/new" element={<MenuForm />} />
          <Route path="/menus/:id/edit" element={<MenuForm />} />

          <Route path="/modules" element={<ModuleList />} />
          <Route path="/modules/new" element={<ModuleForm />} />
          <Route path="/modules/:id/edit" element={<ModuleForm />} />

          <Route path="/memberships" element={<MembershipList />} />
          <Route path="/memberships/new" element={<MembershipForm />} />
          <Route path="/memberships/:id/edit" element={<MembershipForm />} />

          <Route path="/user-roles" element={<UserRoleList />} />
          <Route path="/user-roles/new" element={<UserRoleForm />} />
          <Route path="/user-roles/:id/edit" element={<UserRoleForm />} />

          <Route path="/masters" element={<MastersHubPage />} />
          <Route path="/masters/:masterKey" element={<MasterList />} />
          <Route path="/masters/:masterKey/new" element={<MasterForm />} />
          <Route path="/masters/:masterKey/:id/edit" element={<MasterForm />} />

          <Route path="/school-masters" element={<SchoolMastersHubPage />} />
          <Route path="/school-masters/:masterKey" element={<SchoolMasterList />} />
          <Route path="/school-masters/:masterKey/new" element={<SchoolMasterForm />} />
          <Route path="/school-masters/:masterKey/:id/edit" element={<SchoolMasterForm />} />

          <Route path="/academics" element={<AcademicsHubPage />} />
          <Route path="/academics/:entityKey" element={<AcademicList />} />
          <Route path="/academics/:entityKey/new" element={<AcademicForm />} />
          <Route path="/academics/:entityKey/:id/edit" element={<AcademicForm />} />

          <Route path="/audit-logs" element={<AuditLogList />} />
          <Route path="/audit-logs/:id" element={<AuditLogDetail />} />

          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute requireSuperAdmin />}>
        <Route element={<DashboardLayout />}>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/:section" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
