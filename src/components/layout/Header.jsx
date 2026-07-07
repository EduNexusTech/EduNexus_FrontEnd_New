import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiMenu, FiBell, FiSearch, FiUser, FiLogOut, FiKey, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { notificationService } from '@/api/services'
import { Drawer } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Feedback'
import { formatDateTime, fromNow } from '@/utils/format'
import toast from 'react-hot-toast'

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth()
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
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 glass px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden rounded-xl p-2 text-muted hover:bg-slate-100 hover:text-text"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2 w-72">
            <FiSearch className="h-4 w-4 text-muted" />
            <input
              type="search"
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifOpen(true)}
            className="relative rounded-xl p-2.5 text-muted hover:bg-slate-100 hover:text-text transition"
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
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1.5 pr-3 hover:bg-slate-100 transition"
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
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border bg-white card-shadow py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-semibold truncate">{displayName}</p>
                    <p className="text-xs text-muted truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-slate-50"
                  >
                    <FiUser className="h-4 w-4" /> Profile
                  </Link>
                  <Link
                    to="/change-password"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-text hover:bg-slate-50"
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
              className="text-sm text-primary font-medium hover:underline"
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
                className={`rounded-xl border p-4 ${n.is_read ? 'border-border bg-white' : 'border-primary/20 bg-primary/5'}`}
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
