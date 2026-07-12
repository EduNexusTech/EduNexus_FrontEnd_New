import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiMenu, FiBell, FiMail, FiSearch, FiUser, FiLogOut, FiKey, FiChevronDown, FiZap, FiBook } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { notificationService } from '@/api/services'
import { Drawer } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Feedback'
import { formatDateTime, fromNow } from '@/utils/format'
import toast from 'react-hot-toast'
import { resolvePageTitle } from '@/utils/pageTitle'
import '@/styles/dashboard-clay.css'

export default function Header({ onMenuClick }) {
  const location = useLocation()
  const pageTitle = resolvePageTitle(location.pathname)
  const { user, logout, isSchoolAdmin } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 30000,
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationService.list({ page_size: 20 }),
    enabled: notifOpen,
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
  })

  const unreadCount = unreadData?.data?.count ?? unreadData?.count ?? 0
  const notifications = notifData?.results ?? notifData?.data?.results ?? []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const displayName = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email

  return (
    <>
      <header className="clay-app clay-header-bar sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onMenuClick}
            className="clay-icon-btn p-2 lg:hidden"
          >
            <FiMenu className="h-4 w-4" />
          </button>
          <h1 className="truncate text-base font-semibold text-[var(--clay-primary)] md:text-lg">{pageTitle}</h1>
        </div>

        <div className="hidden max-w-sm flex-1 md:flex">
          <div className="clay-search flex w-full items-center gap-2 px-3 py-2">
            <FiSearch className="h-3.5 w-3.5 shrink-0 text-[var(--clay-primary-soft)]" />
            <input
              type="search"
              placeholder="Search modules, users, schools..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--clay-primary-soft)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!isSchoolAdmin ? (
            <>
              <Link
                to="/ai-hub"
                title="AI Hub"
                className="clay-icon-btn p-2.5 transition"
              >
                <FiZap className="h-5 w-5" />
              </Link>

              <Link
                to="/edu-nexus-post"
                title="EduNexus Mailer"
                className="clay-icon-btn p-2.5 transition"
              >
                <FiMail className="h-5 w-5" />
              </Link>
            </>
          ) : null}

          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="clay-icon-btn relative p-2.5"
            title="Notifications"
          >
            <FiBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="clay-icon-btn flex items-center gap-2 p-1.5 pr-3"
            >
              <Avatar name={displayName} src={user?.profile_image} size="sm" />
              <span className="hidden sm:block text-sm font-medium text-text max-w-[120px] truncate">
                {displayName}
              </span>
              <FiChevronDown className="h-4 w-4 text-muted hidden sm:block" />
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[var(--clay-border)] bg-white/95 backdrop-blur-md py-2 card-shadow">
                  <div className="px-4 py-2 border-b border-[var(--clay-border)]">
                    <p className="text-sm font-semibold truncate text-[var(--clay-primary)]">{displayName}</p>
                    <p className="text-xs text-[var(--clay-primary-soft)] truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--clay-primary)] hover:bg-[var(--clay-mint-light)]"
                  >
                    <FiUser className="h-4 w-4" /> Profile
                  </Link>
                  {isSchoolAdmin ? (
                    <Link
                      to="/school-profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--clay-primary)] hover:bg-[var(--clay-mint-light)]"
                    >
                      <FiBook className="h-4 w-4" /> School Profile
                    </Link>
                  ) : null}
                  <Link
                    to="/change-password"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--clay-primary)] hover:bg-[var(--clay-mint-light)]"
                  >
                    <FiKey className="h-4 w-4" /> Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-red-50"
                  >
                    <FiLogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-muted">{unreadCount} unread</p>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllMutation.mutate()}
              className="text-sm text-[var(--clay-teal)] font-medium hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <p className="text-center text-muted py-8">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border p-4 ${n.is_read ? 'border-[var(--clay-border)] bg-white' : 'border-[var(--clay-accent)]/30 bg-[var(--clay-mint-light)]'}`}
              >
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-sm text-muted mt-1">{n.message}</p>
                <p className="text-xs text-muted mt-2">{fromNow(n.created_at)}</p>
              </div>
            ))
          )}
        </div>
      </Drawer>
    </>
  )
}
