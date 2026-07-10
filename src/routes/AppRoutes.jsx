import { Routes, Route } from 'react-router-dom'
import ProtectedRoute, { PublicRoute } from './ProtectedRoute'
import LandingPage from '@/website/LandingPage'
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

import AuditLogList from '@/pages/audit-logs/AuditLogList'
import AuditLogDetail from '@/pages/audit-logs/AuditLogDetail'

import SettingsPage from '@/pages/settings/SettingsPage'
import NotificationsPage from '@/pages/notifications/NotificationsPage'
import EduNexusPostPage from '@/pages/edu-nexus-post/EduNexusPostPage'
import AiHubPage from '@/pages/ai-hub/AiHubPage'
import AiAssistantPage from '@/pages/ai-hub/AiAssistantPage'
import AutomationsPage from '@/pages/ai-hub/AutomationsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

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
